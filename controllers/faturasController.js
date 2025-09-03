const { poolPromise } = require('../db');
const { v4: uuidv4 } = require('uuid');


// Obter faturas impressão
const getFaturaImpressao = async (req, res) => {
  try {
   // console.log('getFaturaImpressao');
    const { empresa, faturas } = req.query;
    const sql = require('mssql');

    if (!empresa) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "empresa" é obrigatório.'
      });
    }
//console.log('EMPRESA RECEBIDA: ' + empresa);
//console.log('FATURAS RECEBIDAS: ' + faturas);
    if (!faturas) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "faturas" é obrigatório.'
      });
    }
    let faturaArray;
    try {
      faturaArray = JSON.parse(faturas);
      if (!Array.isArray(faturaArray) || faturaArray.length === 0) {
        throw new Error();
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "faturas" deve ser um array válido, ex: [1025,1026].'
      });
    }
//console.log('FATURAS ARRAY: ' + faturaArray);
    const pool = await poolPromise; // <- precisa importar de config de conexão
    const request = pool.request();

    request.input('empresa', empresa);
//console.log('01: ' + empresa);
    const faturaParams = faturaArray.map((id, index) => {
      const paramName = `idfatura${index}`;
      request.input(paramName, sql.Int, id);
      return `@${paramName}`;
    });
//console.log('02: ' + faturaParams);
    const query = `
      SELECT 
        f.idfatura,
        f.dataemissao,
        f.datavencimento,
        f.descricao,
        f.valor,
        f.identidade,
        f.idmoeda,
        f.idfilial,
        f.empresa,
        f.id,
        isnull(e.nome,'') AS entidade,
        CAST(0 AS BIT) AS selecionado,
        isnull(e.CNPJCPF,'') AS cnpjcpf_entidade, 
        isnull(e.Celular1,'') AS celular_entidade, 
        isnull(e.Telefone1,'') AS telefone_entidade, 
        isnull(e.Email,'') AS email_entidade, 
        isnull(fi.Nome,'') AS filial, 
        isnull(fi.CNPJCPF,'') AS cnpjcpf_filial, 
        isnull(fi.Celular1,'') AS celular_filial, 
        isnull(fi.Telefone1,'') AS telefone_filial, 
        isnull(fi.Email,'') AS email_filial, 
        isnull(fi.Home,'') AS home_filial, 
        isnull(fi.Logradouro,'') AS logradouro_filial, 
        isnull(fi.Complemento,'') AS complemento_filial, 
        isnull(fi.Numero,'') AS numero_filial, 
        isnull(fi.Estado,'') AS estado_filial, 
        isnull(fi.Cidade,'') AS cidade_filial, 
        isnull(fi.Bairro,'') AS bairro_filial, 
        isnull(fi.CEP,'') AS cep_filial, 
        isnull(ee.Logradouro,'') AS logradouro_entidade, 
        isnull(ee.Complemento,'') AS complemento_entidade, 
        isnull(ee.Numero,'') AS numero_entidade, 
        isnull(ee.Estado,'') AS estado_entidade, 
        isnull(ee.Cidade,'') AS cidade_entidade, 
        isnull(ee.Bairro,'') AS bairro_entidade, 
        isnull(ee.CEP,'') AS cep_entidade
      FROM Faturas f
      INNER JOIN Entidades e ON e.IdEntidade = f.IdEntidade
      LEFT JOIN Filiais fi ON f.IdFilial = fi.IdFilial
      LEFT JOIN Entidades_Enderecos ee ON ee.IdEntidade = e.IdEntidade
      WHERE f.empresa = @empresa 
        AND f.idfatura IN (${faturaParams.join(',')})
      ORDER BY f.idfatura
    `;

    //console.log('RESULTADO DA QUERY:' + query.toString());

    const result = await request.query(query);
    //console.log(result.recordset);
    res.json(result.recordset);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter itens faturas impressão
const getItensFaturaImpressao = async (req, res) => {
  try {
    //console.log('getItensFaturaImpressao');
    const { empresa, idfatura } = req.query;
    const sql = require('mssql');

    if (!empresa) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "empresa" é obrigatório.'
      });
    }

    if (!idfatura) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "idfatura" é obrigatório.'
      });
    }

    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    request.input('idfatura', sql.Int, idfatura);

    const query = `
      SELECT  
          vb.id, 
          vb.dataVenda as dataemissao, 
          ivb.pax, 
          isnull(ent.Nome,'') AS fornecedor, 
          isnull(op.Nome,'') AS operadora, 
          isnull(ent.sigla,'') AS sigla, 
          ('Pax: '+ISNULL(ivb.Pax,'')+' Serviço: '+ISNULL(ivb.Trecho,'')+' '+ISNULL(ent.Sigla,'')+' '+ISNULL(ivb.Bilhete,'')+' '+
          ISNULL(LEFT(ivb.TipoVoo, 3),'')) AS descricao,
          isnull(ivb.valorbilhete,0) AS valor, 
          isnull(ivb.ValorTaxaBilhete,0) AS valortaxa, 
          isnull(ivb.ValorTaxaServico,0) AS valorservico, 
          isnull(ivb.ValorAssento,0) AS valoroutros,
          isnull(vb.observacao,'') AS observacao, 
          isnull(vb.solicitante,'') AS solicitante, 
          isnull(fp.Nome,'') AS pagamento
      FROM VendasBilhetes vb
      INNER JOIN ItensVendaBilhete ivb ON vb.IdVenda = ivb.IdVenda
      INNER JOIN FormaPagamento fp ON vb.IdFormaPagamento = fp.IdFormaPagamento
      LEFT JOIN Entidades op ON ivb.IdOperadora = op.IdEntidade
      LEFT JOIN Entidades ent ON ivb.IdCiaAerea = ent.IdEntidade
      WHERE vb.empresa = @empresa AND vb.idfatura = @idfatura

      UNION ALL

      SELECT  
          vb.id, 
          vb.dataVenda as dataemissao, 
          '' AS pax, 
          '' AS fornecedor, 
          '' AS operadora, 
          '' AS sigla, 
          ('Desconto') AS descricao,
          isnull(vb.Descontototal,0) AS valor, 
          0 AS valortaxa, 
          0 AS valorservico, 
          0 AS valoroutros,
          '' AS observacao, 
          '' AS solicitante, 
          '' AS pagamento
      FROM VendasBilhetes vb
      INNER JOIN ItensVendaBilhete ivb ON vb.IdVenda = ivb.IdVenda
      INNER JOIN FormaPagamento fp ON vb.IdFormaPagamento = fp.IdFormaPagamento
      LEFT JOIN Entidades op ON ivb.IdOperadora = op.IdEntidade
      LEFT JOIN Entidades ent ON ivb.IdCiaAerea = ent.IdEntidade
      WHERE vb.empresa = @empresa AND vb.idfatura = @idfatura
      AND vb.Descontototal > 0
      GROUP BY vb.id, vb.dataVenda, vb.Descontototal

      UNION ALL

      SELECT
          vh.id, 
          vh.DataVenda as dataemissao, 
          ivh.pax, 
          isnull(ent2.Nome,'') AS fornecedor, 
          isnull(op2.Nome,'') AS operadora, 
          isnull(ent2.sigla,'') AS sigla, 
          ('Pax: '+ISNULL(ivh.Pax,'')+' Serviço: '+ISNULL(ivh.Descricao,'')+' prestado por ' + isnull(ent2.Nome,'')+
          ' período: ' + ISNULL(CONVERT(varchar(10), ivh.PeriodoIni, 103),'')+' a '+ISNULL(CONVERT(varchar(10), ivh.PeriodoFin, 103),'')) AS descricao,
          isnull(ivh.ValorHotel,0) AS valor, 
          isnull(ivh.ValorTaxa,0) AS valortaxa, 
          isnull(ivh.ValorDU,0) AS valorservico, 
          isnull(ivh.ValorOutros,0) AS valoroutros,
          isnull(vh.observacao,'') AS observacao, 
          isnull(vh.solicitante,'') AS solicitante, 
          isnull(fp2.Nome,'') AS pagamento
      FROM VendasHoteis vh
      INNER JOIN ItensVendaHotel ivh ON vh.IdVenda = ivh.IdVenda
      INNER JOIN FormaPagamento fp2 ON vh.IdFormaPagamento = fp2.IdFormaPagamento
      LEFT JOIN Entidades op2 ON ivh.IdOperadora = op2.IdEntidade
      LEFT JOIN Entidades ent2 ON ivh.IdFornecedor = ent2.IdEntidade
      WHERE vh.empresa = @empresa AND vh.idfatura = @idfatura

      UNION ALL

      SELECT
          vh.id, 
          vh.DataVenda as dataemissao, 
          '' AS pax, 
          '' AS fornecedor, 
          '' AS operadora, 
          '' AS sigla, 
          ('Desconto') AS descricao,
          isnull(vh.Descontototal,0) AS valor, 
          0 AS valortaxa, 
          0 AS valorservico, 
          0 AS valoroutros,
          '' AS observacao, 
          '' AS solicitante, 
          '' AS pagamento
      FROM VendasHoteis vh
      INNER JOIN ItensVendaHotel ivh ON vh.IdVenda = ivh.IdVenda
      INNER JOIN FormaPagamento fp2 ON vh.IdFormaPagamento = fp2.IdFormaPagamento
      LEFT JOIN Entidades op2 ON ivh.IdOperadora = op2.IdEntidade
      LEFT JOIN Entidades ent2 ON ivh.IdFornecedor = ent2.IdEntidade
      WHERE vh.empresa = @empresa AND vh.idfatura = @idfatura
      AND vh.Descontototal > 0
      GROUP BY vh.id, vh.dataVenda, vh.Descontototal

      ORDER BY 2, 1
    `;
    //console.log('RESULTADO DA QUERY:' + query.toString());

    const result = await request.query(query);
    //console.log(result.recordset);
    res.json(result.recordset);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obter todos os faturas
const getFatura = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, pax, faturainicial, faturafinal, bilheteinicial, bilhetefinal, servicoinicial, servicofinal, datainicial, datafinal  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    let semFiltros = 'false';

    if ((!idfilial)&&(!identidade)&&(!idmoeda)&&(!pax)&&(!faturainicial)&&(!faturafinal)&&(!bilheteinicial)&&(!bilhetefinal)&&(!servicoinicial)&&(!servicofinal)&&(!datainicial)&&(!datafinal))
      semFiltros = 'true';

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClauseBilhete = 'WHERE ft.empresa = @empresa AND ft.id > 0 ';
    let whereClauseServico = 'WHERE ft.empresa = @empresa AND ft.id > 0 ';

    if (semFiltros === 'true') {
      whereClauseBilhete += ' AND ft.identidade = -1';  
      whereClauseServico += ' AND ft.identidade = -1';  
    }

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClauseBilhete += ' AND ft.idfilial = @idfilial';
      whereClauseServico += ' AND ft.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClauseBilhete += ' AND ft.identidade = @identidade';
      whereClauseServico += ' AND ft.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClauseBilhete += ' AND ft.idmoeda = @idmoeda';
      whereClauseServico += ' AND ft.idmoeda = @idmoeda';
    }

    if (faturainicial) {
      request.input('faturainicial', faturainicial);
      whereClauseBilhete += ' AND ft.id >= @faturainicial';
      whereClauseServico += ' AND ft.id >= @faturainicial';
    }
    
    if (faturafinal) {
      request.input('faturafinal', faturafinal);
      whereClauseBilhete += ' AND ft.id <= @faturafinal';
      whereClauseServico += ' AND ft.id <= @faturafinal';
    }
    
    if (bilheteinicial) {
      request.input('bilheteinicial', bilheteinicial);
      whereClauseBilhete += ' AND vb.id >= @bilheteinicial';
    }
    
    if (bilhetefinal) {
      request.input('bilhetefinal', bilhetefinal);
      whereClauseBilhete += ' AND vb.id <= @bilhetefinal';
    }

    if (servicoinicial) {
      request.input('servicoinicial', servicoinicial);
      whereClauseServico += ' AND vh.id >= @servicoinicial';
    }
    
    if (servicofinal) {
      request.input('servicofinal', servicofinal);
      whereClauseServico += ' AND vh.id <= @servicofinal';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClauseBilhete += ' AND ft.dataemissao >= @datainicial';
      whereClauseServico += ' AND ft.dataemissao >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClauseBilhete += ' AND ft.dataemissao <= @datafinal';
      whereClauseServico += ' AND ft.dataemissao <= @datafinal';
    }

    if (pax) {
      request.input('pax', `%${pax}%`);
      whereClauseBilhete += ' AND ivb.pax LIKE @pax';
      whereClauseServico += ' AND ivh.pax LIKE @pax';
    }

   // whereClause += ' ORDER BY faturas.dataemissao desc ';

    const query =
     `
          SELECT      tabela.idfatura,
                      tabela.dataemissao,
                      tabela.datavencimento,
                      tabela.descricao,
                      tabela.valor,
                      tabela.identidade,
                      tabela.idmoeda,
                      tabela.idfilial,
                      tabela.empresa,
                      tabela.id,
                      tabela.entidade,
                      tabela.valorentrada,
                      CAST(0 AS BIT) AS selecionado
          FROM(
          SELECT      ft.idfatura,
                      ft.dataemissao,
                      ft.datavencimento,
                      ft.descricao,
                      ft.valor,
                      ft.identidade,
                      ft.idmoeda,
                      ft.idfilial,
                      ft.empresa,
                      ft.id,
                      ent.nome AS entidade,
                      isnull(TitulosReceber.valorpago,0) AS valorentrada
          FROM            VendasBilhetes AS vb INNER JOIN
                                  ItensVendaBilhete AS ivb ON vb.IdVenda = ivb.IdVenda INNER JOIN
                                  Faturas AS ft ON vb.IdFatura = ft.IdFatura INNER JOIN
                                  FormaPagamento AS fp ON vb.IdFormaPagamento = fp.IdFormaPagamento INNER JOIN
                                  Entidades AS ent ON ft.IdEntidade = ent.IdEntidade LEFT OUTER JOIN
                                  TitulosReceber ON ft.IdFatura = TitulosReceber.IdFatura
          ${whereClauseBilhete}
              group by 
                  ft.idfatura,
                  ft.dataemissao,
                  ft.datavencimento,
                  ft.descricao,
                  ft.valor,
                  ft.identidade,
                  ft.idmoeda,
                  ft.idfilial,
                  ft.empresa,
                  ft.id,
                  ent.nome,
                  titulosreceber.valorpago

          UNION ALL

          SELECT      ft.idfatura,
                      ft.dataemissao,
                      ft.datavencimento,
                      ft.descricao,
                      ft.valor,
                      ft.identidade,
                      ft.idmoeda,
                      ft.idfilial,
                      ft.empresa,
                      ft.id,
                      ent.nome AS entidade,
                      isnull(TitulosReceber.valorpago,0) AS valorentrada
          FROM            VendasHoteis AS vh INNER JOIN
                                  ItensVendaHotel AS ivh ON vh.IdVenda = ivh.IdVenda INNER JOIN
                                  Faturas AS ft ON vh.IdFatura = ft.IdFatura INNER JOIN
                                  FormaPagamento AS fp ON vh.IdFormaPagamento = fp.IdFormaPagamento INNER JOIN
                                  Entidades AS ent ON ft.IdEntidade = ent.IdEntidade LEFT OUTER JOIN
                                  TitulosReceber ON ft.IdFatura = TitulosReceber.IdFatura
          ${whereClauseServico}

          GROUP BY 
                      ft.idfatura,
                      ft.dataemissao,
                      ft.datavencimento,
                      ft.descricao,
                      ft.valor,
                      ft.identidade,
                      ft.idmoeda,
                      ft.idfilial,
                      ft.empresa,
                      ft.id,
                      ent.nome,
                      titulosreceber.valorpago
          ) AS tabela 
          group by    tabela.idfatura,
                      tabela.dataemissao,
                      tabela.datavencimento,
                      tabela.descricao,
                      tabela.valor,
                      tabela.identidade,
                      tabela.idmoeda,
                      tabela.idfilial,
                      tabela.empresa,
                      tabela.id,
                      tabela.entidade,
                      tabela.valorentrada
                      
                      ORDER BY tabela.dataemissao desc, tabela.id `
    //console.log('QUERY: ' + query);
   const result = await request.query(query);
   //console.log(result.recordset);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter todos os faturas
const getEmissao = async (req, res) => {
  try {
    //console.log('getEmissao');
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal, aereo, servico  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    let semFiltros = 'false';

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('aereo', aereo);
    request.input('servico', servico);

    let scriptAereo = '';
    let scriptServico = '';
    let unionClause = '';
    if((aereo === 'true')&&(servico === 'true')) {
      unionClause = ' UNION ';
    }

    if ((!idfilial)&&(!identidade)&&(!idmoeda)&&(!datainicial)&&(!datafinal))
      semFiltros = 'true';

    if( aereo === 'true') {
      
      request.input('empresa', empresa);
    
      // Parâmetros opcionais
      let whereClauseAereo = ' AND VendasBilhetes.empresa = @empresa  ';

      if (semFiltros === 'true') {
        whereClauseAereo += ' AND VendasBilhetes.identidade = -1';
      }

      // Filtros opcionais
      if (idfilial) {
        request.input('idfilial', idfilial);
        whereClauseAereo += ' AND VendasBilhetes.idfilial = @idfilial';
      }

      if (identidade) {
        request.input('identidade', identidade);
        whereClauseAereo += ' AND VendasBilhetes.identidade = @identidade';
      }

      if (idmoeda) {
        request.input('idmoeda', idmoeda);
        whereClauseAereo += ' AND VendasBilhetes.idmoeda = @idmoeda';
      }
      
      if (datainicial) {
        request.input('datainicial', datainicial);
        whereClauseAereo += ' AND VendasBilhetes.datavenda >= @datainicial';
      }
      
      if (datafinal) {
        request.input('datafinal', datafinal);
        whereClauseAereo += ' AND VendasBilhetes.datavenda <= @datafinal';
      }

      scriptAereo = 
      `
        SELECT  VendasBilhetes.idvenda, ISNULL(VendasBilhetes.valortotal, 0) AS valortotal, 
                VendasBilhetes.observacao, ISNULL(VendasBilhetes.solicitante, '') AS solicitante, 
                VendasBilhetes.identidade, VendasBilhetes.id, 
                VendasBilhetes.empresa, FormaPagamento.Nome AS pagamento, 
                VendasBilhetes.datavencimento, VendasBilhetes.idformapagamento,
                VendasBilhetes.idcentrocusto, VendasBilhetes.idmoeda, Cast(0 AS BIT) AS selecionado,
                Entidades.nome AS entidade, 'BILHETE' AS tipo, VendasBilhetes.idfilial
        FROM            FormaPagamento RIGHT OUTER JOIN
                                VendasBilhetes INNER JOIN
                                Entidades ON VendasBilhetes.IdEntidade = Entidades.IdEntidade ON FormaPagamento.IdFormaPagamento = VendasBilhetes.IdFormaPagamento LEFT OUTER JOIN
                                Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                ItensVendaBilhete ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda
        WHERE           (ISNULL(VendasBilhetes.idfatura,0) = 0) AND (ISNULL(VendasBilhetes.valortotal,0) > 0)  ${whereClauseAereo} 

        GROUP BY VendasBilhetes.idvenda, VendasBilhetes.valortotal, 
                VendasBilhetes.observacao, VendasBilhetes.solicitante, 
                VendasBilhetes.identidade, VendasBilhetes.id, 
                VendasBilhetes.empresa, FormaPagamento.nome, 
                VendasBilhetes.datavencimento, VendasBilhetes.idformapagamento,
                VendasBilhetes.idcentroCusto, VendasBilhetes.idmoeda, Entidades.nome, VendasBilhetes.idfilial
       
        
        `
    }

    if(servico === 'true') {
      
      request.input('empresa2', empresa);
    
      // Parâmetros opcionais
      let whereClauseServico = ' AND VendasHoteis.empresa = @empresa2  ';

      if (semFiltros === 'true') {
        whereClauseServico += ' AND VendasHoteis.identidade = -1';
      }

      // Filtros opcionais
      if (idfilial) {
        request.input('idfilial2', idfilial);
        whereClauseServico += ' AND VendasHoteis.idfilial = @idfilial2';
      }

      if (identidade) {
        request.input('identidade2', identidade);
        whereClauseServico += ' AND VendasHoteis.identidade = @identidade2';
      }

      if (idmoeda) {
        request.input('idmoeda2', idmoeda);
        whereClauseServico += ' AND VendasHoteis.idmoeda = @idmoeda2';
      }
      
      if (datainicial) {
        request.input('datainicial2', datainicial);
        whereClauseServico += ' AND VendasHoteis.datavenda >= @datainicial2';
      }
      
      if (datafinal) {
        request.input('datafinal2', datafinal);
        whereClauseServico += ' AND VendasHoteis.datavenda <= @datafinal2';
      }

      scriptServico = 
      `
      ${unionClause}
        SELECT  VendasHoteis.idvenda, ISNULL(VendasHoteis.valortotal, 0) AS valortotal, 
                VendasHoteis.observacao, ISNULL(VendasHoteis.solicitante, '') AS solicitante, 
                VendasHoteis.identidade, VendasHoteis.id, 
                VendasHoteis.empresa, FormaPagamento.nome AS pagamento, 
                VendasHoteis.datavencimento, VendasHoteis.idformapagamento,
                VendasHoteis.idcentrocusto, VendasHoteis.idmoeda, Cast(0 AS BIT) AS selecionado,
                Entidades.nome AS entidade, 'SERVICO' AS tipo, VendasHoteis.idfilial
        FROM            FormaPagamento RIGHT OUTER JOIN
                                VendasHoteis INNER JOIN
                                Entidades ON VendasHoteis.IdEntidade = Entidades.IdEntidade ON FormaPagamento.IdFormaPagamento = VendasHoteis.IdFormaPagamento LEFT OUTER JOIN
                                Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                ItensVendaHotel ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda
        WHERE           (ISNULL(VendasHoteis.idfatura,0) = 0) AND (ISNULL(VendasHoteis.valortotal,0) > 0)
        ${whereClauseServico}
        GROUP BY VendasHoteis.idvenda, VendasHoteis.valortotal,
                VendasHoteis.observacao, VendasHoteis.solicitante,
                VendasHoteis.identidade, VendasHoteis.id, 
                VendasHoteis.empresa, FormaPagamento.nome, 
                VendasHoteis.datavencimento, VendasHoteis.idformapagamento,
                VendasHoteis.idcentrocusto, VendasHoteis.idmoeda, Entidades.nome, VendasHoteis.idfilial
       
      `
    }
    
    const query =
     `  ${scriptAereo} ${scriptServico}  `
   
    const result = await request.query(query);
    
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
    //console.log(error.message); 
  }
};

// Obter uma fatura pelo ID
const getFaturaById = async (req, res) => {
  try {
    const { idfatura } = req.params;

    if (!idfatura) {
      return res.status(400).json({ success: false, message: 'O parâmetro "idfatura" é obrigatório.' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('idfatura', req.params.idfatura)
      .query(`
            faturas.idfatura,
            faturas.dataemissao,
            faturas.datavencimento,
            faturas.descricao,
            faturas.valor,
            faturas.identidade,
            faturas.idmoeda,
            faturas.idfilial,
            faturas.empresa,
            faturas.id,
            entidades.nome AS entidade
            FROM            faturas LEFT OUTER JOIN
                            Entidades ON faturas.IdEntidade = faturas.IdEntidade
            WHERE idfatura = @idfatura                
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ success: false, message: 'fatura não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Criar uma nova fatura
const createFatura = async (req, res) => {
  try {
    //console.log('ENTROU NA API');
    const faturas = req.body; // espera receber um array de objetos

    if (!Array.isArray(faturas)) {
      return res.status(400).json({ success: false, message: 'O body deve ser uma lista de faturas' });
    }

    const listaIdFatura = [];

    for (const fatura of faturas) {
      const {
        dataemissao,
        datavencimento,
        descricao,
        valor,
        identidade,
        idmoeda,
        idfilial,
        empresa,
        id,
        idformapagamento,
        idplanoconta,
        idtitulo,
        bilhete = [], // valor padrão caso não exista
        servico = [], // valor padrão caso não exista
      } = fatura;

      //************** INSERE FATURA ***************** */
      const poolFat = await poolPromise;
      const resultFat = await poolFat
        .request()
        .input('dataemissao', dataemissao)
        .input('datavencimento', datavencimento)
        .input('descricao', descricao)
        .input('valor', valor)
        .input('identidade', identidade)
        .input('idmoeda', idmoeda)
        .input('idfilial', idfilial)
        .input('chave', uuidv4())
        .input('empresa', empresa)
        .input('id', id)
        .input('desconto', 0)
        .input('valorentrada', 0)
        .query(`
          INSERT INTO faturas (
              dataemissao,
              datavencimento,
              descricao,
              valor,
              identidade,
              idmoeda,
              idfilial,
              chave,
              empresa,
              id,
              desconto,
              valorentrada
          )
          OUTPUT INSERTED.idfatura
          VALUES (
              @dataemissao,
              @datavencimento,
              @descricao,
              @valor,
              @identidade,
              @idmoeda,
              @idfilial,
              @chave,
              @empresa,
              @id,
              @desconto,
              @valorentrada
          )
        `);

      const idfatura = resultFat.recordset[0].idfatura;

      // Adiciona na lista de retorno
      listaIdFatura.push(idfatura);

      //************** INSERE TITULO RECEBER *************** */ 
      const pool = await poolPromise;
      await pool
        .request()
        .input('dataemissao', dataemissao)
        .input('datavencimento', datavencimento)
        .input('datacompetencia', dataemissao)
        .input('descricao', 'Fatura ' + id)
        .input('documento', id)
        .input('valor', valor)
        .input('valorpago', 0)
        .input('descontopago', 0)
        .input('juropago', 0)
        .input('parcela', 1)
        .input('idfatura', idfatura)
        .input('identidade', identidade)
        .input('idmoeda', idmoeda)
        .input('idformapagamento', idformapagamento)
        .input('idplanoconta', idplanoconta)
        .input('idfilial', idfilial)
        .input('chave', uuidv4())
        .input('empresa', empresa)
        .input('id', idtitulo)
        .query(`
          INSERT INTO titulosreceber (
              dataemissao,
              datavencimento,
              datacompetencia,
              descricao,
              documento,
              valor,
              valorpago,
              descontopago,
              juropago,
              parcela,
              idfatura,
              identidade,
              idmoeda,
              idformapagamento,
              idplanoconta,
              idfilial,
              chave,
              empresa,
              id
          )
          OUTPUT INSERTED.idtitulo
          VALUES (
              @dataemissao,
              @datavencimento,
              @datacompetencia,
              @descricao,
              @documento,
              @valor,
              @valorpago,
              @descontopago,
              @juropago,
              @parcela,
              @idfatura,
              @identidade,
              @idmoeda,
              @idformapagamento,
              @idplanoconta,
              @idfilial,
              @chave,
              @empresa,
              @id
          )
        `);

        // Atualiza bilhetes
        for (const idvenda of bilhete) {
          //console.log('Atualiza bilhete: ', idvenda);
          const poolBil = await poolPromise;
          await poolBil
            .request()
            .input('idvenda', idvenda)
            .input('idfatura', idfatura)
            .query(`
              UPDATE vendasbilhetes SET
                  idfatura = @idfatura
              WHERE idvenda = @idvenda
            `);
        }

        // Atualiza serviços
        for (const idvenda of servico) {
         // console.log('Atualiza servico: ', idvenda);
          const poolSer = await poolPromise;
          await poolSer
            .request()
            .input('idvenda', idvenda)
            .input('idfatura', idfatura)
            .query(`
              UPDATE vendashoteis SET
                  idfatura = @idfatura
              WHERE idvenda = @idvenda
            `);
        }



    }
      

    // Retorna a lista de idfatura
    res.status(201).json({
      success: true,
      message: 'Faturas criadas com sucesso',
      idfaturas: listaIdFatura
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Atualizar um fatura existente
const updateFatura = async (req, res) => {
  try {
   // console.log('ENTROU NA API');
    const {
          dataemissao,
          datavencimento,
          descricao,
          valor,
          identidade,
          idmoeda,
          idfilial,
          chave,
          empresa,
          id
    } = req.body;
    //console.log(req.body);
    const pool = await poolPromise;
    await pool
      .request()
      .input('idfatura', req.params.idfatura)
      .input('dataemissao', dataemissao)
      .input('datavencimento', datavencimento)
      .input('descricao', descricao)
      .input('valor', valor)
      .input('identidade', identidade)
      .input('idmoeda', idmoeda)
      .input('idfilial', idfilial)
      .input('chave', chave)
      .input('empresa', empresa)
      .input('id', id)
      .query(`
        UPDATE faturas SET
            dataemissao = @dataemissao,
            datavencimento = @datavencimento,
            descricao = @descricao,
            valor = @valor,
            identidade = @identidade,
            idmoeda = @idmoeda,
            idfilial = @idfilial,
            chave = @chave,
            empresa = @empresa,
            id = @id
          WHERE idfatura = @idfatura
      `);

    res.json({ success: true, message: 'Fatura atualizado com sucesso' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFatura = async (req, res) => {
  try {
   // console.log('ENTROU NA API DELETE');
    const { faturas } = req.body; // 🔹 Lista de IDs de faturas no body
    const sql = require('mssql');

    if (!faturas || !Array.isArray(faturas) || faturas.length === 0) {
      return res.status(400).json({ success: false, message: 'A lista de faturas é obrigatória e deve conter ao menos 1 ID.' });
    }

    const pool = await poolPromise;

    for (const idfatura of faturas) {
      // 🔹 Deleta TitulosReceber relacionados
      await pool
        .request()
        .input('idfatura', idfatura)
        .query('DELETE FROM TitulosReceber WHERE idfatura = @idfatura');
//console.log('DELETE FROM TitulosReceber WHERE idfatura = ' + idfatura);
      // 🔹 Atualiza VendasBilhetes -> idfatura = null
      await pool
        .request()
        .input('idfatura', idfatura)
        .query('UPDATE VendasBilhetes SET idfatura = NULL WHERE idfatura = @idfatura');
        //console.log('UPDATE VendasBilhetes SET idfatura = NULL WHERE idfatura = ' + idfatura);

      // 🔹 Atualiza VendasHoteis -> idfatura = null
      await pool
        .request()
        .input('idfatura', idfatura)
        .query('UPDATE VendasHoteis SET idfatura = NULL WHERE idfatura = @idfatura');
        //console.log('UPDATE VendasHoteis SET idfatura = NULL WHERE idfatura = ' + idfatura);

      // 🔹 Por último deleta a fatura
      await pool
        .request()
        .input('idfatura', idfatura)
        .query('DELETE FROM Faturas WHERE idfatura = @idfatura');
        //console.log('DELETE FROM Faturas WHERE idfatura = ' + idfatura);
    }

    res.json({ success: true, message: 'Faturas deletadas com sucesso.' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Deletar um fatura
/*
const deleteFatura = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('idfatura', req.params.idfatura)
      .query('DELETE FROM faturas WHERE idfatura = @idfatura');
    res.json({ success: true, message: 'Fatura deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
*/

module.exports = {
  getFatura,
  getFaturaById,
  createFatura,
  updateFatura,
  deleteFatura,
  getEmissao,
  getFaturaImpressao,
  getItensFaturaImpressao
};
