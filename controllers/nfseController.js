// controllers/nfseController.js
const { poolPromise } = require('../db');
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');

/**
 * Helper: remove tudo que não for dígito
 */
function onlyDigits(str) {
  if (!str && str !== 0) return '';
  return String(str).replace(/\D/g, '');
}

/**
 * POST /nfse/importar
 * Recebe: { empresa, notas: [ { cnpjPrestador, cpfCnpjTomador, dataEmissao, dataVencimento, numeroNf, valorBruto, valorLiquido, valorISS, valorIR, valorCSLL, valorINSS, valorCOFINS, valorPIS, valorIPI, descricao, itens: [ { descricao, valorBruto, ... } ] } ] }
 *
 * Processa cada nota:
 *  - encontra filial por CNPJ do prestador (filiais.cnpj)
 *  - encontra entidade por CPF/CNPJ do tomador (entidades.cnpjcpf)
 *  - checa duplicidade: SELECT count(*) FROM nf WHERE idfilial=@idfilial AND identidade=@identidade AND numeronf=@numeroNf
 *  - se não duplicada: insere em transação nf -> itensnf -> titulosreceber
 *
 * Retorna um resumo com status por nota (importada / ignorada-duplicada / erro)
 */
// nfse_service.js
// Inserção completa: NFSe + Itens + Contas a Receber
const importarNfse = async (req, res) => {
  try {
    const { empresa, moeda, pagamento, planoconta, notas } = req.body;

    if (!empresa) {
      return res.status(400).json({ success: false, message: 'Parâmetro "empresa" é obrigatório.' });
    }
    if (!moeda) {
      return res.status(400).json({ success: false, message: 'Parâmetro "moeda" é obrigatória.' });
    }
    if (!pagamento) {
      return res.status(400).json({ success: false, message: 'Parâmetro "pagamento" é obrigatório.' });
    }
    if (!planoconta) {
      return res.status(400).json({ success: false, message: 'Parâmetro "plano" é obrigatório.' });
    }

    if (!Array.isArray(notas) || notas.length === 0) {
      return res.status(400).json({ success: false, message: 'Parâmetro "notas" deve ser um array com ao menos 1 elemento.' });
    }

    const pool = await poolPromise;
    const summary = [];

    for (const nota of notas) {
      const itemResumo = { numeroNf: nota.numeroNf ?? nota.numeronf ?? null, status: 'pendente', message: null };
//console.log(`-----------------------------------------`);
      // Campos principais
      const cnpjPrestador = onlyDigits(nota.cnpjPrestador || nota.cnpj_prestador || nota.prestadorCnpj || '');
      const cpfCnpjTomador = onlyDigits(nota.cpfCnpjTomador || nota.cpf_cnpj_tomador || nota.tomadorCpfCnpj || '');
      const numeroNf = String(nota.numeroNf ?? nota.numeronf ?? nota.numero ?? '');
      const dataEmissao = nota.dataEmissao ? new Date(nota.dataEmissao) : null;
      const dataVencimento = nota.dataVencimento ? new Date(nota.dataVencimento)
                      : (nota.dataEmissao ? new Date(nota.dataEmissao) : null);
      const dataCompetencia = nota.dataEmissao ? new Date(nota.dataEmissao) : null;

      const valorBruto = Number(nota.valorBruto ?? nota.valorbruto ?? nota.valortotal ?? 0);
      const valorLiquido = Number(nota.valorLiquido ?? nota.valorliquido ?? valorBruto ?? 0);
      const valorIR = Number(nota.valorIR ?? nota.valorir ?? 0);
      const valorCSLL = Number(nota.valorCSLL ?? nota.valorcsll ?? 0);
      const valorINSS = Number(nota.valorINSS ?? nota.valorinss ?? 0);
      const valorICMS = Number(nota.valorICMS ?? nota.valoricms ?? 0);
      const valorISS = Number(nota.valorISS ?? nota.valoriss ?? 0);
      const valorCOFINS = Number(nota.valorCOFINS ?? nota.valorcofins ?? 0);
      const valorPIS = Number(nota.valorPIS ?? nota.valorpis ?? 0);
      const valorIPI = Number(nota.valorIPI ?? nota.valoripi ?? 0);
      const descricao = nota.descricao ?? nota.obs ?? 'SERVIÇO';
      const idtitulo = nota.idtitulo ?? null;
      //const moeda = 2;
      //const formapagamento = 8;
      //const planoconta = 24;
      let chave = ''; 

      try {
        // 1) Buscar filial
        let idfilial = null;
        if (cnpjPrestador) {
          const rFilial = await pool.request()
            .input('cnpj', cnpjPrestador)
            .query(`
              SELECT idfilial FROM filiais 
              WHERE REPLACE(REPLACE(REPLACE(cnpjcpf, '.', ''), '/', ''), '-', '') = @cnpj
            `);
          if (rFilial.recordset.length > 0) idfilial = rFilial.recordset[0].idfilial;
        }
//console.log(`(##01##)CNPJ Prestador: ${cnpjPrestador} => idfilial: ${idfilial}`);
        // 2) Buscar entidade
        let identidade = null;
        if (cpfCnpjTomador) {
          const rEnt = await pool.request()
            .input('cpfcnpj', cpfCnpjTomador)
            .query(`
              SELECT identidade FROM entidades 
              WHERE REPLACE(REPLACE(REPLACE(cnpjcpf, '.', ''), '/', ''), '-', '') = @cpfcnpj
            `);
          if (rEnt.recordset.length > 0) identidade = rEnt.recordset[0].identidade;
        }
//console.log(`(##02##)CPF/CNPJ Tomador: ${cpfCnpjTomador} => identidade: ${identidade}`);        

        if (!idfilial || !identidade) {
          itemResumo.status = 'erro';
          itemResumo.message = `Filial (${idfilial}) ou entidade (${identidade}) não encontrada.`;
          summary.push(itemResumo);
          continue;
        }

        // 3) Verificar duplicidade
        const rDup = await pool.request()
          .input('idfilial', idfilial)
          .input('identidade', identidade)
          .input('numeronf', numeroNf)
          .query(`SELECT COUNT(*) AS qt FROM nf WHERE idfilial=@idfilial AND identidade=@identidade AND numeronf=@numeronf`);
        if (Number(rDup.recordset[0].qt) > 0) {
          itemResumo.status = 'duplicada';
          itemResumo.message = 'Nota já existente.';
          summary.push(itemResumo);
          continue;
        }
//console.log(`(##03##)Importando NF ${numeroNf} para idfilial ${idfilial}, identidade ${identidade}...`);
        // 4) Transação
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
          // --- NF ---
          chave = uuidv4(); 
          const trNf = new sql.Request(transaction);
          trNf.input('idfilial', idfilial)
            .input('identidade', identidade)
            .input('dataemissao', dataEmissao)
            .input('datavencimento', dataVencimento)
            .input('numeronf', numeroNf)
            .input('valortotal', valorBruto)
            .input('valorir', valorIR)
            .input('valorcsll', valorCSLL)
            .input('valorinss', valorINSS)
            .input('valoricms', valorICMS)
            .input('valoriss', valorISS)
            .input('valorcofins', valorCOFINS)
            .input('valorpis', valorPIS)
            .input('valoripi', valorIPI)
            .input('empresa', empresa)
            .input('chave', chave)
            .input('idformapagamento', pagamento)//8
            .input('idplanoconta', planoconta)//24
            .input('idmoeda', moeda)//2
            .input('natureza', 'ENTRADA')
            .input('tipo', 'SERVICO');
//console.log(`(##04##)Inserindo NF...`);
          const rInsertNf = await trNf.query(`
            INSERT INTO nf (
              idfilial, identidade, dataemissao, datavencimento, numeronf,
              valortotal, valorir, valorcsll, valorinss, valoricms,
              valoriss, valorcofins, valorpis, valoripi, empresa, chave,
              idformapagamento, idplanoconta, idmoeda, natureza, tipo
            )
            VALUES (
              @idfilial, @identidade, @dataemissao, @datavencimento, @numeronf,
              @valortotal, @valorir, @valorcsll, @valorinss, @valoricms,
              @valoriss, @valorcofins, @valorpis, @valoripi, @empresa, @chave,
              @idformapagamento, @idplanoconta, @idmoeda, @natureza, @tipo
            );
            SELECT SCOPE_IDENTITY() AS id;
          `);
//console.log(`(##04.01##)NF inserida, resultado:`, rInsertNf.recordset);

          const idNf = rInsertNf.recordset[0]?.id;
//console.log(`(##04.02##)idNf retornado: ${idNf}`);
          if (!idNf) throw new Error('Falha ao inserir NF (id não retornado).');

          // --- ITENSNF ---
          const itens = Array.isArray(nota.itens) && nota.itens.length > 0
            ? nota.itens
            : [{ descricao, valorBruto }];

//console.log('Itens a inserir:', itens);

          for (const it of itens) {
            const itDescricao = it.descricao ?? descricao ?? '';
            const itValor = Number(it.valorBruto ?? it.valor ?? valorBruto ?? 0) || 0;

            const trItem = new sql.Request(transaction);
            await trItem
              .input('idnf', idNf)
              .input('numeronf', numeroNf)
              .input('descricao', itDescricao)
              .input('valorunitario', itValor)
              .input('valortotal', itValor)
              .input('valoricms', Number(it.valorICMS ?? 0))
              .input('valoriss', Number(it.valorISS ?? 0))
              .input('valorcofins', Number(it.valorCOFINS ?? 0))
              .input('valorpis', Number(it.valorPIS ?? 0))
              .input('valoripi', Number(it.valorIPI ?? 0))
              .input('valorir', Number(it.valorIR ?? 0))
              .input('valorcsll', Number(it.valorCSLL ?? 0))
              .input('valorinss', Number(it.valorINSS ?? 0))
              .input('quantidade', 1)
              .query(`
                INSERT INTO ItensNF (
                  IdNF, NumeroNF, Descricao, ValorUnitario, ValorTotal,
                  ValorICMS, ValorISS, ValorCOFINS, ValorPIS, ValorIPI,
                  ValorIR, ValorCSLL, ValorINSS, Quantidade
                ) VALUES (
                  @idnf, @numeronf, @descricao, @valorunitario, @valortotal,
                  @valoricms, @valoriss, @valorcofins, @valorpis, @valoripi,
                  @valorir, @valorcsll, @valorinss, @quantidade
                )
              `);
          }

          // --- TITULOSRECEBER ---
          chave = uuidv4(); 
          const trTitulo = new sql.Request(transaction);
          await trTitulo
            .input('idfilial', idfilial)
            .input('identidade', identidade)
            .input('dataemissao', dataEmissao)
            .input('datacompetencia', dataCompetencia)
            .input('datavencimento', dataVencimento)
            .input('numeronf', numeroNf)
            .input('idnf', idNf)
            .input('valor', valorLiquido)
            .input('empresa', empresa)
            .input('chave', chave)
            .input('idformapagamento', pagamento)
            .input('idplanoconta', planoconta)
            .input('idmoeda', moeda)
            .input('valorpago', 0)
            .input('descontopago', 0)
            .input('juropago', 0)
            .input('descricao', descricao)
            .input('documento', idNf)
            .input('parcela', 1)
            .input('id', idtitulo)
            .query(`
              INSERT INTO titulosreceber (
                idfilial, identidade, dataemissao, datavencimento, datacompetencia,
                numeronf, idnf, valor, empresa, chave, idformapagamento, idplanoconta, idmoeda,
                valorpago, descontopago, juropago, descricao, documento, parcela, id
              ) VALUES (
                @idfilial, @identidade, @dataemissao, @datavencimento, @datacompetencia,
                @numeronf, @idnf, @valor, @empresa, @chave, @idformapagamento, @idplanoconta, @idmoeda,
                @valorpago, @descontopago, @juropago, @descricao, @documento, @parcela, @id
              )
            `);

          await transaction.commit();
          itemResumo.status = 'importada';
          itemResumo.message = 'Importada com sucesso.';
        } catch (errTx) {
          await transaction.rollback();
          console.error('Erro na transação:', errTx);
          itemResumo.status = 'erro';
          itemResumo.message = `Erro na transação: ${errTx.message}`;
        }
      } catch (errNota) {
        itemResumo.status = 'erro';
        itemResumo.message = `Erro ao processar nota: ${errNota.message}`;
      }

      summary.push(itemResumo);
    }

    return res.json({ success: true, summary });
  } catch (error) {
    console.error('importarNfse error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * GET /nfse
 * Lista NF (simples) - filtro opcional por empresa
 */
const getNfse = async (req, res) => {
  try {
    const { empresa } = req.query;
    const pool = await poolPromise;
    const request = pool.request();

    let where = '';
    if (empresa) {
      request.input('empresa', empresa);
      where = ' WHERE nf.empresa = @empresa ';
    }

    const query = `
      SELECT nf.idnf AS id, nf.numeronf, nf.dataemissao, nf.datavencimento,
             nf.valortotal, nf.identidade, nf.idfilial
      FROM nf
      ${where}
      ORDER BY nf.dataemissao DESC
    `;
    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /nfse/:id
 */
const getNfseById = async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('idnf', id)
      .query(`SELECT * FROM nf WHERE idnf = @idnf`);
    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ success: false, message: 'NF não encontrada' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /nfse/:id
 * Atualiza campos selecionáveis de nf (ex.: datavencimento, valor, etc.)
 * Body pode conter os campos que quer atualizar.
 */
const updateNfse = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      dataemissao, datavencimento, valortotal, valoriss, valorir, valorcsll,
      valorinss, valorcofins, valorpis, valoripi
    } = req.body;

    const pool = await poolPromise;
    const request = pool.request();

    // Build dynamic set
    let setParts = [];
    if (dataemissao !== undefined) { request.input('dataemissao', dataemissao); setParts.push('dataemissao = @dataemissao'); }
    if (datavencimento !== undefined) { request.input('datavencimento', datavencimento); setParts.push('datavencimento = @datavencimento'); }
    if (valortotal !== undefined) { request.input('valortotal', valortotal); setParts.push('valortotal = @valortotal'); }
    if (valoriss !== undefined) { request.input('valoriss', valoriss); setParts.push('valoriss = @valoriss'); }
    if (valorir !== undefined) { request.input('valorir', valorir); setParts.push('valorir = @valorir'); }
    if (valorcsll !== undefined) { request.input('valorcsll', valorcsll); setParts.push('valorcsll = @valorcsll'); }
    if (valorinss !== undefined) { request.input('valorinss', valorinss); setParts.push('valorinss = @valorinss'); }
    if (valorcofins !== undefined) { request.input('valorcofins', valorcofins); setParts.push('valorcofins = @valorcofins'); }
    if (valorpis !== undefined) { request.input('valorpis', valorpis); setParts.push('valorpis = @valorpis'); }
    if (valoripi !== undefined) { request.input('valoripi', valoripi); setParts.push('valoripi = @valoripi'); }

    if (setParts.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar enviado.' });
    }

    const sqlUpdate = `UPDATE nf SET ${setParts.join(', ')} WHERE idnf = @idnf`;
    request.input('idnf', id);
    await request.query(sqlUpdate);

    return res.json({ success: true, message: 'NF atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /nfse/:id
 * Deleta NF e registros relacionados (itensnf, titulosreceber) em transação.
 */
const deleteNfse = async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await poolPromise;

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const tr = transaction.request();
      tr.input('idnf', id);

      // Deleta titulosreceber relacionados
      await tr.query('DELETE FROM titulosreceber WHERE idnf = @idnf');

      // Deleta itensnf relacionados
      await tr.query('DELETE FROM itensnf WHERE idnf = @idnf');

      // Deleta nf
      await tr.query('DELETE FROM nf WHERE idnf = @idnf');

      await transaction.commit();
      return res.json({ success: true, message: 'NF e registros relacionados deletados com sucesso.' });
    } catch (errTx) {
      await transaction.rollback();
      return res.status(500).json({ success: false, message: `Erro ao deletar NF: ${errTx.message}` });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  importarNfse,
  getNfse,
  getNfseById,
  updateNfse,
  deleteNfse
};
