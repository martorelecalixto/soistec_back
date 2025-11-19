const { poolPromise } = require('../db');
const { v4: uuidv4 } = require('uuid');


// Obter faturas impressão
const getFaturaImpressao = async (req, res) => {
  try {

    const { empresa, faturas } = req.query;
    const sql = require('mssql');

    if (!empresa) {
      return res.status(400).json({
        success: false,
        message: 'O parâmetro "empresa" é obrigatório.'
      });
    }

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

    const pool = await poolPromise; // <- precisa importar de config de conexão
    const request = pool.request();

    request.input('empresa', empresa);
    const faturaParams = faturaArray.map((id, index) => {
    const paramName = `idfatura${index}`;
    request.input(paramName, sql.Int, id);
    return `@${paramName}`;
    });

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
          isnull(fp.Nome,'') AS pagamento,
          vb.idfilial
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
          '' AS pagamento,
          vb.idfilial
      FROM VendasBilhetes vb
      INNER JOIN ItensVendaBilhete ivb ON vb.IdVenda = ivb.IdVenda
      INNER JOIN FormaPagamento fp ON vb.IdFormaPagamento = fp.IdFormaPagamento
      LEFT JOIN Entidades op ON ivb.IdOperadora = op.IdEntidade
      LEFT JOIN Entidades ent ON ivb.IdCiaAerea = ent.IdEntidade
      WHERE vb.empresa = @empresa AND vb.idfatura = @idfatura
      AND vb.Descontototal > 0
      GROUP BY vb.id, vb.dataVenda, vb.Descontototal, vb.idfilial

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
          isnull(fp2.Nome,'') AS pagamento,
          vh.idfilial
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
          '' AS pagamento,
          vh.idfilial
      FROM VendasHoteis vh
      INNER JOIN ItensVendaHotel ivh ON vh.IdVenda = ivh.IdVenda
      INNER JOIN FormaPagamento fp2 ON vh.IdFormaPagamento = fp2.IdFormaPagamento
      LEFT JOIN Entidades op2 ON ivh.IdOperadora = op2.IdEntidade
      LEFT JOIN Entidades ent2 ON ivh.IdFornecedor = ent2.IdEntidade
      WHERE vh.empresa = @empresa AND vh.idfatura = @idfatura
      AND vh.Descontototal > 0
      GROUP BY vh.id, vh.dataVenda, vh.Descontototal, vh.idfilial

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
    const { empresa, idfilial, identidade, idmoeda, idgrupo, pax, faturainicial, faturafinal, bilheteinicial, bilhetefinal, servicoinicial, servicofinal, datainicial, datafinal, vencimentoinicial, vencimentofinal  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    let semFiltros = 'false';

    if ((!idfilial)&&(!identidade)&&(!idmoeda)&&(!idgrupo)&&(!pax)&&(!faturainicial)&&(!faturafinal)&&(!bilheteinicial)&&(!bilhetefinal)&&(!servicoinicial)&&(!servicofinal)&&(!datainicial)&&(!datafinal)&&(!vencimentoinicial)&&(!vencimentofinal))
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

    if (idgrupo) {
      request.input('idgrupo', idgrupo);
      whereClauseBilhete += ' AND vb.idgrupo = @idgrupo';
      whereClauseServico += ' AND vh.idgrupo = @idgrupo';
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

    if (vencimentoinicial) {
      request.input('vencimentoinicial', vencimentoinicial);
      whereClauseBilhete += ' AND ft.datavencimento >= @vencimentoinicial';
      whereClauseServico += ' AND ft.datavencimento >= @vencimentoinicial';
    }
    
    if (vencimentofinal) {
      request.input('vencimentofinal', vencimentofinal);
      whereClauseBilhete += ' AND ft.datavencimento <= @vencimentofinal';
      whereClauseServico += ' AND ft.datavencimento <= @vencimentofinal';
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
    const { empresa, idfilial, identidade, idmoeda, idgrupo, datainicial, datafinal, 
       vencimentoinicial, vencimentofinal, aereo, servico  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
   // console.log('Empresa: ' + empresa);
   // console.log('Aéreo: ' + aereo);
   // console.log('Serviço: ' + servico);

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

    if ( ((!idfilial)&&(!identidade)&&(!idmoeda)&&(!datainicial)&&(!datafinal)) || ((aereo === 'false')&&(servico === 'false')) )
      semFiltros = 'true';

    //console.log('Sem filtros: ' + semFiltros);
    //console.log('Aéreo: ' + aereo);
    //console.log(req.query);

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

      if (idgrupo) {
        request.input('idgrupo', idgrupo);
        whereClauseAereo += ' AND VendasBilhetes.idgrupo = @idgrupo';
      }

      if (vencimentoinicial) {
        request.input('vencimentoinicial', vencimentoinicial);
        whereClauseAereo += ' AND VendasBilhetes.datavencimento >= @vencimentoinicial';
      }
      
      if (vencimentofinal) {
        request.input('vencimentofinal', vencimentofinal);
        whereClauseAereo += ' AND VendasBilhetes.datavencimento <= @vencimentofinal';
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
                VendasBilhetes.datavencimento, VendasBilhetes.idformapagamento, VendasBilhetes.datavenda,
                VendasBilhetes.idcentrocusto, VendasBilhetes.idmoeda, Cast(0 AS BIT) AS selecionado,
                Entidades.nome AS entidade, 'AEREO' AS tipo, VendasBilhetes.idfilial
        FROM            FormaPagamento RIGHT OUTER JOIN
                                VendasBilhetes INNER JOIN
                                Entidades ON VendasBilhetes.IdEntidade = Entidades.IdEntidade ON FormaPagamento.IdFormaPagamento = VendasBilhetes.IdFormaPagamento LEFT OUTER JOIN
                                Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                ItensVendaBilhete ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda
        WHERE           (ISNULL(VendasBilhetes.idfatura,0) = 0) AND (ISNULL(VendasBilhetes.valortotal,0) > 0)  ${whereClauseAereo} 

        GROUP BY VendasBilhetes.idvenda, VendasBilhetes.valortotal, 
                VendasBilhetes.observacao, VendasBilhetes.solicitante, 
                VendasBilhetes.identidade, VendasBilhetes.id, 
                VendasBilhetes.empresa, FormaPagamento.nome, VendasBilhetes.datavenda,
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

      if (idgrupo) {
        request.input('idgrupo', idgrupo);
        whereClauseAereo += ' AND VendasHoteis.idgrupo = @idgrupo';
      }

      if (vencimentoinicial) {
        request.input('vencimentoinicial', vencimentoinicial);
        whereClauseAereo += ' AND VendasHoteis.datavencimento >= @vencimentoinicial';
      }
      
      if (vencimentofinal) {
        request.input('vencimentofinal', vencimentofinal);
        whereClauseAereo += ' AND VendasHoteis.datavencimento <= @vencimentofinal';
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
                VendasHoteis.datavencimento, VendasHoteis.idformapagamento, VendasHoteis.datavenda,
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
                VendasHoteis.empresa, FormaPagamento.nome, VendasHoteis.datavenda,
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

// Obter relatorios analítico de vendas bilhetes
const getRelatoriosAnalitico = async (req, res) => {
  try {
    //console.log('getEmissao');
    const { empresa, idfilial, identidade, idmoeda, idgrupo, idoperadora, datainicial, datafinal, 
       vencimentoinicial, vencimentofinal, bilheteinicial, bilhetefinal, servicoinicial, servicofinal, 
       faturainicial, faturafinal, pax, tipo  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
   // console.log('Empresa: ' + empresa);
   // console.log('Aéreo: ' + aereo);
   // console.log('Serviço: ' + servico);

    let semFiltros = 'false';

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();


    let orderbyClause = '';
    let scriptAereo = '';
    let scriptServico = '';
    let unionClause = '';
    unionClause = ' UNION ';

    if ( ((!idfilial)&&(!identidade)&&(!idmoeda)&&(!idgrupo)&&(!idoperadora)&&(!datainicial)&&(!datafinal)&&(!vencimentoinicial)&&(!vencimentofinal)&&
         (!bilheteinicial)&&(!bilhetefinal)&&(!servicoinicial)&&(!servicofinal)&&(!faturainicial)&&(!faturafinal)&&(!pax)  )  )
      semFiltros = 'true';

    //console.log('Sem filtros: ' + semFiltros);
    //console.log('Aéreo: ' + aereo);
    //console.log(req.query);

    //if( aereo === 'true') {
      
      if(tipo == 'Cliente')
          orderbyClause += ' ORDER BY 5, 6, 1 '
      else
      if(tipo == 'Emissao')
        orderbyClause += ' ORDER BY 6, 5, 1 '
      else
      if(tipo == 'Vencimento')
        orderbyClause += ' ORDER BY 7, 5, 1 '
      else
      if(tipo == 'Operadora')
        orderbyClause += ' ORDER BY 12, 6, 1 '
      else
      if(tipo == 'Fatura')
        orderbyClause += ' ORDER BY 1, 6, 5 ';
      else
      if(tipo == 'SemFatura')
        orderbyClause += ' ORDER BY 3, 2, 1 ';



      request.input('empresa', empresa);
    
      // Parâmetros opcionais
      let whereClauseAereo = ' WHERE VendasBilhetes.empresa = @empresa  ';

      if (semFiltros === 'true') {
        whereClauseAereo += ' AND VendasBilhetes.identidade = -1';
      }

      if (tipo === 'SemFatura') {
        whereClauseAereo += ' AND Isnull(VendasBilhetes.IdFatura,0) = 0 and FormaPagamento.GerarFatura = 1';
      }

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

      if (idgrupo) {
        request.input('idgrupo', idgrupo);
        whereClauseAereo += ' AND VendasBilhetes.idgrupo = @idgrupo';
      }

      if (vencimentoinicial) {
        request.input('vencimentoinicial', vencimentoinicial);
        whereClauseAereo += ' AND VendasBilhetes.datavencimento >= @vencimentoinicial';
      }
      
      if (vencimentofinal) {
        request.input('vencimentofinal', vencimentofinal);
        whereClauseAereo += ' AND VendasBilhetes.datavencimento <= @vencimentofinal';
      }
      
      if (datainicial) {
        request.input('datainicial', datainicial);
        whereClauseAereo += ' AND VendasBilhetes.datavenda >= @datainicial';
      }
      
      if (datafinal) {
        request.input('datafinal', datafinal);
        whereClauseAereo += ' AND VendasBilhetes.datavenda <= @datafinal';
      }

      if (idoperadora) {
        request.input('idoperadora', idoperadora);
        whereClause += ' AND ItensVendaBilhete.idoperadora = @idoperadora';
      }

      if (pax) {
        request.input('pax', `%${pax}%`);
        whereClause += ' AND ItensVendaBilhete.pax LIKE @pax';
      }

      if (servicoinicial) {
        request.input('bilheteinicial', bilheteinicial);
        whereClause += ' AND vendasbilhetes.id >= @bilheteinicial';
      }
      
      if (servicofinal) {
        request.input('bilhetefinal', bilhetefinal);
        whereClause += ' AND vendasbilhetes.id <= @bilhetefinal';
      }

      if (faturainicial) {
        request.input('faturainicial', faturainicial);
        whereClause += ' AND Faturas.id >= @faturainicial';
      }
      
      if (faturafinal) {
        request.input('faturafinal', faturafinal);
        whereClause += ' AND Faturas.id <= @faturafinal';
      }

      if(tipo == 'SemFatura'){
        scriptAereo = 
        `
          SELECT      
                VendasBilhetes.Id AS idvenda, 
                entidades_3.Nome AS entidade, 
                VendasBilhetes.datavenda AS dataemissao, 
                VendasBilhetes.datavencimento,
                ISNULL(VendasBilhetes.ValorTotal, 0) AS valoroutros, 
                FormaPagamento.Nome AS pagamento, 
                'AEREO' AS tipo,
                Entidades_4.nome AS operadora
          FROM            TitulosReceber RIGHT OUTER JOIN
                                  Faturas RIGHT OUTER JOIN
                                  Moeda INNER JOIN
                                  Entidades AS Entidades_3 INNER JOIN
                                  VendasBilhetes ON Entidades_3.IdEntidade = VendasBilhetes.IdEntidade ON Moeda.IdMoeda = VendasBilhetes.IdMoeda INNER JOIN
                                  Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial ON Faturas.IdFatura = VendasBilhetes.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                  Entidades INNER JOIN
                                  ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                  Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                  Entidades AS entidades_1 ON VendasBilhetes.IdVendedor = entidades_1.IdEntidade LEFT OUTER JOIN
                                  Entidades AS entidades_2 ON VendasBilhetes.IdEmissor = entidades_2.IdEntidade LEFT OUTER JOIN
                                  RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                  FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                  Grupos ON VendasBilhetes.IdGrupo = Grupos.Id

          ${whereClauseAereo} 

          GROUP BY    
                entidades_3.Nome, 
                VendasBilhetes.datavenda, 
                VendasBilhetes.DataVencimento,
                VendasBilhetes.ValorTotal, 
                VendasBilhetes.Id, 
                FormaPagamento.Nome,
                Entidades_4.nome    
          
          `
      }else{
      scriptAereo = 
        `
          SELECT      Faturas.Id AS idfatura,
                Faturas.valor, 
                Isnull(TitulosReceber.ValorPago,0) AS valorpago,
                TitulosReceber.id AS idtitulo,
                entidades_3.Nome AS entidade, 
                Faturas.dataemissao, 
                Faturas.datavencimento,
                ISNULL(VendasBilhetes.ValorTotal, 0) AS valoroutros, 
                VendasBilhetes.Id AS idvenda, 
                FormaPagamento.Nome AS pagamento, 
                'AEREO' AS tipo,
                Entidades_4.nome AS operadora
          FROM            TitulosReceber RIGHT OUTER JOIN
                                  Filiais RIGHT OUTER JOIN
                                  VendasBilhetes INNER JOIN
                                  Faturas INNER JOIN
                                  Entidades AS Entidades_3 ON Faturas.IdEntidade = Entidades_3.IdEntidade ON VendasBilhetes.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                  Moeda ON Faturas.IdMoeda = Moeda.IdMoeda ON Filiais.IdFilial = Faturas.IdFilial ON TitulosReceber.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                  Entidades INNER JOIN
                                  ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                  Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                  Entidades AS entidades_1 ON VendasBilhetes.IdVendedor = entidades_1.IdEntidade LEFT OUTER JOIN
                                  Entidades AS entidades_2 ON VendasBilhetes.IdEmissor = entidades_2.IdEntidade LEFT OUTER JOIN
                                  RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                  FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                  Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
        
          ${whereClauseAereo} 

          GROUP BY    Faturas.Id,
                Faturas.valor, 
                entidades_3.Nome, 
                Faturas.DataEmissao, 
                Faturas.DataVencimento,
                VendasBilhetes.ValorTotal, 
                VendasBilhetes.Id, 
                FormaPagamento.Nome,
                TitulosReceber.ValorPago,
                TitulosReceber.id,
                Entidades_4.nome       
          
          `

      }
   // }

    //if(servico === 'true') {
      
      request.input('empresa2', empresa);
    
      // Parâmetros opcionais
      let whereClauseServico = ' WHERE VendasHoteis.empresa = @empresa2  ';

      if (semFiltros === 'true') {
        whereClauseServico += ' AND VendasHoteis.identidade = -1';
      }

      if (tipo === 'SemFatura') {
        whereClauseServico += ' AND Isnull(VendasHoteis.IdFatura,0) = 0 and FormaPagamento.GerarFatura = 1';
      }

      if (tipo === 'true') {
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

      if (idgrupo) {
        request.input('idgrupo', idgrupo);
        whereClauseAereo += ' AND VendasHoteis.idgrupo = @idgrupo';
      }

      if (vencimentoinicial) {
        request.input('vencimentoinicial', vencimentoinicial);
        whereClauseAereo += ' AND VendasHoteis.datavencimento >= @vencimentoinicial';
      }
      
      if (vencimentofinal) {
        request.input('vencimentofinal', vencimentofinal);
        whereClauseAereo += ' AND VendasHoteis.datavencimento <= @vencimentofinal';
      }
      
      if (datainicial) {
        request.input('datainicial2', datainicial);
        whereClauseServico += ' AND VendasHoteis.datavenda >= @datainicial2';
      }
      
      if (datafinal) {
        request.input('datafinal2', datafinal);
        whereClauseServico += ' AND VendasHoteis.datavenda <= @datafinal2';
      }

      if (idoperadora) {
        request.input('idoperadora', idoperadora);
        whereClause += ' AND ItensVendaHotel.idoperadora = @idoperadora';
      }

      if (pax) {
        request.input('pax', `%${pax}%`);
        whereClause += ' AND ItensVendaHotel.pax LIKE @pax';
      }

      if (servicoinicial) {
        request.input('servicoinicial', servicoinicial);
        whereClause += ' AND vendashoteis.id >= @servicoinicial';
      }
      
      if (servicofinal) {
        request.input('servicofinal', servicofinal);
        whereClause += ' AND vendashoteis.id <= @servicofinal';
      }

      if (faturainicial) {
        request.input('faturainicial', faturainicial);
        whereClause += ' AND Faturas.id >= @faturainicial';
      }
      
      if (faturafinal) {
        request.input('faturafinal', faturafinal);
        whereClause += ' AND Faturas.id <= @faturafinal';
      }

      if(tipo == 'SemFatura'){

          scriptServico = 
          `
          ${unionClause}

          SELECT      
                VendasHoteis.Id AS idvenda, 
                entidades_3.Nome AS entidade, 
                VendasHoteis.datavenda AS dataemissao, 
                VendasHoteis.datavencimento,
                ISNULL(VendasHoteis.ValorTotal, 0) AS valoroutros, 
                FormaPagamento.Nome AS pagamento, 
                'SERVICO' AS tipo,
                Entidades_4.nome AS operadora
          FROM            TitulosReceber RIGHT OUTER JOIN
                                  Faturas RIGHT OUTER JOIN
                                  Moeda INNER JOIN
                                  Entidades AS Entidades_3 INNER JOIN
                                  VendasHoteis ON Entidades_3.IdEntidade = VendasHoteis.IdEntidade ON Moeda.IdMoeda = VendasHoteis.IdMoeda INNER JOIN
                                  Filiais ON VendasHoteis.IdFilial = Filiais.IdFilial ON Faturas.IdFatura = VendasHoteis.IdFatura ON TitulosReceber.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                  Entidades INNER JOIN
                                  ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                  Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                  Entidades AS entidades_1 ON VendasHoteis.IdVendedor = entidades_1.IdEntidade LEFT OUTER JOIN
                                  Entidades AS entidades_2 ON VendasHoteis.IdEmissor = entidades_2.IdEntidade LEFT OUTER JOIN
                                  RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                  FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                  Grupos ON VendasHoteis.IdGrupo = Grupos.Id

          ${whereClauseServico}
          
          GROUP BY   
                entidades_3.Nome, 
                VendasHoteis.datavenda, 
                VendasHoteis.DataVencimento,
                VendasHoteis.ValorTotal, 
                VendasHoteis.Id, 
                FormaPagamento.Nome,
                Entidades_4.nome
        
        `
      }else{
          scriptServico = 
          `
          ${unionClause}

          SELECT      Faturas.Id AS idfatura,
                Faturas.valor, 
                Isnull(TitulosReceber.ValorPago,0) AS valorpago,
                TitulosReceber.id AS idtitulo,
                entidades_3.Nome AS entidade, 
                Faturas.dataemissao, 
                Faturas.datavencimento,
                ISNULL(VendasHoteis.ValorTotal, 0) AS valoroutros, 
                VendasHoteis.Id AS idvenda, 
                FormaPagamento.Nome AS pagamento, 
                'SERVICO' AS tipo,
                Entidades_4.nome AS operadora
          FROM            TitulosReceber RIGHT OUTER JOIN
                                  Filiais RIGHT OUTER JOIN
                                  VendasHoteis INNER JOIN
                                  Faturas INNER JOIN
                                  Entidades AS Entidades_3 ON Faturas.IdEntidade = Entidades_3.IdEntidade ON VendasHoteis.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                  Moeda ON Faturas.IdMoeda = Moeda.IdMoeda ON Filiais.IdFilial = Faturas.IdFilial ON TitulosReceber.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                  Entidades INNER JOIN
                                  ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                  Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                  Entidades AS entidades_1 ON VendasHoteis.IdVendedor = entidades_1.IdEntidade LEFT OUTER JOIN
                                  Entidades AS entidades_2 ON VendasHoteis.IdEmissor = entidades_2.IdEntidade LEFT OUTER JOIN
                                  RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                  FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                  Grupos ON VendasHoteis.IdGrupo = Grupos.Id

          ${whereClauseServico}
          
          GROUP BY    Faturas.Id,
                Faturas.valor, 
                entidades_3.Nome, 
                Faturas.DataEmissao, 
                Faturas.DataVencimento,
                VendasHoteis.ValorTotal, 
                VendasHoteis.Id, 
                FormaPagamento.Nome,
                TitulosReceber.ValorPago,
                TitulosReceber.id,
                Entidades_4.nome
        
        `

      }

    //}
    
    const query =
     `  ${scriptAereo} ${scriptServico} ${orderbyClause} `
   
    const result = await request.query(query);
    
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
    //console.log(error.message); 
  }
};

// Obter relatórios sintético de vendas bilhetes
const getRelatoriosSintetico = async (req, res) => {
  try {
    //console.log('getEmissao');
    const { empresa, idfilial, identidade, idmoeda, idgrupo, idoperadora, datainicial, datafinal, 
       vencimentoinicial, vencimentofinal, bilheteinicial, bilhetefinal, servicoinicial, servicofinal, 
       faturainicial, faturafinal, pax, tipo  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
   // console.log('Empresa: ' + empresa);
   // console.log('Aéreo: ' + aereo);
   // console.log('Serviço: ' + servico);

    let semFiltros = 'false';

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    let scriptInicio = '';
    let scriptFim = '';
    let orderbyClause = '';
    let scriptAereo = '';
    let scriptServico = '';
    let unionClause = '';
    unionClause = ' UNION ';

    if ( ((!idfilial)&&(!identidade)&&(!idmoeda)&&(!idgrupo)&&(!idoperadora)&&(!datainicial)&&(!datafinal)&&(!vencimentoinicial)&&(!vencimentofinal)&&
         (!bilheteinicial)&&(!bilhetefinal)&&(!servicoinicial)&&(!servicofinal)&&(!faturainicial)&&(!faturafinal)&&(!pax)  )  )
      semFiltros = 'true';

    //console.log('Sem filtros: ' + semFiltros);
    //console.log('Aéreo: ' + aereo);
    //console.log(req.query);

    //if( aereo === 'true') {

      scriptInicio = 
          `
            SELECT  tabela.idfatura,
                  tabela.valor, 
                  tabela.valorpago,
                  tabela.idtitulo,
                  tabela.entidade, 
                  tabela.dataemissao, 
                  tabela.datavencimento
            FROM    (

            `

      scriptFim = 
          `
            ) AS tabela
            GROUP BY  tabela.idfatura,
                  tabela.valor, 
                  tabela.valorpago,
                  tabela.idtitulo,
                  tabela.entidade, 
                  tabela.dataemissao, 
                  tabela.datavencimento
            `

      if(tipo == 'Cliente')
          orderbyClause += ' ORDER BY tabela.entidade, tabela.dataemissao, tabela.idfatura '
      else
      if(tipo == 'Emissao')
        orderbyClause += ' ORDER BY tabela.dataemissao, tabela.entidade, tabela.idfatura '
      else
      if(tipo == 'Vencimento')
        orderbyClause += ' ORDER BY tabela.datavencimento, tabela.entidade, tabela.idfatura '
      else
      if(tipo == 'Operadora')
        orderbyClause += ' ORDER BY tabela.operadora, tabela.dataemissao, tabela.idfatura '
      else
      if(tipo == 'Fatura')
        orderbyClause += ' ORDER BY tabela.idfatura, tabela.dataemissao, tabela.entidade ';


      request.input('empresa', empresa);
    
      // Parâmetros opcionais
      let whereClauseAereo = ' WHERE VendasBilhetes.empresa = @empresa  ';

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

      if (idgrupo) {
        request.input('idgrupo', idgrupo);
        whereClauseAereo += ' AND VendasBilhetes.idgrupo = @idgrupo';
      }

      if (vencimentoinicial) {
        request.input('vencimentoinicial', vencimentoinicial);
        whereClauseAereo += ' AND VendasBilhetes.datavencimento >= @vencimentoinicial';
      }
      
      if (vencimentofinal) {
        request.input('vencimentofinal', vencimentofinal);
        whereClauseAereo += ' AND VendasBilhetes.datavencimento <= @vencimentofinal';
      }
      
      if (datainicial) {
        request.input('datainicial', datainicial);
        whereClauseAereo += ' AND VendasBilhetes.datavenda >= @datainicial';
      }
      
      if (datafinal) {
        request.input('datafinal', datafinal);
        whereClauseAereo += ' AND VendasBilhetes.datavenda <= @datafinal';
      }

      if (idoperadora) {
        request.input('idoperadora', idoperadora);
        whereClause += ' AND ItensVendaBilhete.idoperadora = @idoperadora';
      }

      if (pax) {
        request.input('pax', `%${pax}%`);
        whereClause += ' AND ItensVendaBilhete.pax LIKE @pax';
      }

      if (servicoinicial) {
        request.input('bilheteinicial', bilheteinicial);
        whereClause += ' AND vendasbilhetes.id >= @bilheteinicial';
      }
      
      if (servicofinal) {
        request.input('bilhetefinal', bilhetefinal);
        whereClause += ' AND vendasbilhetes.id <= @bilhetefinal';
      }

      if (faturainicial) {
        request.input('faturainicial', faturainicial);
        whereClause += ' AND Faturas.id >= @faturainicial';
      }
      
      if (faturafinal) {
        request.input('faturafinal', faturafinal);
        whereClause += ' AND Faturas.id <= @faturafinal';
      }

      scriptAereo = 
      `
        SELECT  Faturas.Id AS idfatura,
              Faturas.valor, 
              Isnull(TitulosReceber.ValorPago,0) AS valorpago,
              TitulosReceber.id AS idtitulo,
              entidades_3.Nome AS entidade, 
              Faturas.DataEmissao, 
              Faturas.DataVencimento
        FROM            TitulosReceber RIGHT OUTER JOIN
                                Filiais RIGHT OUTER JOIN
                                VendasBilhetes INNER JOIN
                                Faturas INNER JOIN
                                Entidades AS Entidades_3 ON Faturas.IdEntidade = Entidades_3.IdEntidade ON VendasBilhetes.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                Moeda ON Faturas.IdMoeda = Moeda.IdMoeda ON Filiais.IdFilial = Faturas.IdFilial ON TitulosReceber.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                Entidades INNER JOIN
                                ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                Entidades AS entidades_1 ON VendasBilhetes.IdVendedor = entidades_1.IdEntidade LEFT OUTER JOIN
                                Entidades AS entidades_2 ON VendasBilhetes.IdEmissor = entidades_2.IdEntidade LEFT OUTER JOIN
                                RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
      
        ${whereClauseAereo} 

        GROUP BY    Faturas.Id,
              Faturas.valor, 
              entidades_3.Nome, 
              Faturas.DataEmissao, 
              Faturas.DataVencimento,
              TitulosReceber.ValorPago,
              TitulosReceber.id
        
        `
   // }

    //if(servico === 'true') {
      
      request.input('empresa2', empresa);
    
      // Parâmetros opcionais
      let whereClauseServico = ' WHERE VendasHoteis.empresa = @empresa2  ';

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

      if (idgrupo) {
        request.input('idgrupo', idgrupo);
        whereClauseAereo += ' AND VendasHoteis.idgrupo = @idgrupo';
      }

      if (vencimentoinicial) {
        request.input('vencimentoinicial', vencimentoinicial);
        whereClauseAereo += ' AND VendasHoteis.datavencimento >= @vencimentoinicial';
      }
      
      if (vencimentofinal) {
        request.input('vencimentofinal', vencimentofinal);
        whereClauseAereo += ' AND VendasHoteis.datavencimento <= @vencimentofinal';
      }
      
      if (datainicial) {
        request.input('datainicial2', datainicial);
        whereClauseServico += ' AND VendasHoteis.datavenda >= @datainicial2';
      }
      
      if (datafinal) {
        request.input('datafinal2', datafinal);
        whereClauseServico += ' AND VendasHoteis.datavenda <= @datafinal2';
      }

      if (idoperadora) {
        request.input('idoperadora', idoperadora);
        whereClause += ' AND ItensVendaHotel.idoperadora = @idoperadora';
      }

      if (pax) {
        request.input('pax', `%${pax}%`);
        whereClause += ' AND ItensVendaHotel.pax LIKE @pax';
      }

      if (servicoinicial) {
        request.input('servicoinicial', servicoinicial);
        whereClause += ' AND vendashoteis.id >= @servicoinicial';
      }
      
      if (servicofinal) {
        request.input('servicofinal', servicofinal);
        whereClause += ' AND vendashoteis.id <= @servicofinal';
      }

      if (faturainicial) {
        request.input('faturainicial', faturainicial);
        whereClause += ' AND Faturas.id >= @faturainicial';
      }
      
      if (faturafinal) {
        request.input('faturafinal', faturafinal);
        whereClause += ' AND Faturas.id <= @faturafinal';
      }


      scriptServico = 
      `
      ${unionClause}

        SELECT   Faturas.Id AS idfatura,
              Faturas.valor, 
              Isnull(TitulosReceber.ValorPago,0) AS valorpago,
              TitulosReceber.id AS idtitulo,
              entidades_3.Nome AS entidade, 
              Faturas.DataEmissao, 
              Faturas.DataVencimento
        FROM            TitulosReceber RIGHT OUTER JOIN
                                Filiais RIGHT OUTER JOIN
                                VendasHoteis INNER JOIN
                                Faturas INNER JOIN
                                Entidades AS Entidades_3 ON Faturas.IdEntidade = Entidades_3.IdEntidade ON VendasHoteis.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                Moeda ON Faturas.IdMoeda = Moeda.IdMoeda ON Filiais.IdFilial = Faturas.IdFilial ON TitulosReceber.IdFatura = Faturas.IdFatura LEFT OUTER JOIN
                                Entidades INNER JOIN
                                ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON VendasHoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                Entidades AS entidades_1 ON VendasHoteis.IdVendedor = entidades_1.IdEntidade LEFT OUTER JOIN
                                Entidades AS entidades_2 ON VendasHoteis.IdEmissor = entidades_2.IdEntidade LEFT OUTER JOIN
                                RecibosReceber ON VendasHoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                FormaPagamento ON VendasHoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                Grupos ON VendasHoteis.IdGrupo = Grupos.Id

        ${whereClauseServico}
        
        GROUP BY    Faturas.Id,
              Faturas.valor, 
              entidades_3.Nome, 
              Faturas.DataEmissao, 
              Faturas.DataVencimento,
              TitulosReceber.ValorPago,
              TitulosReceber.id
       
      `
    //}
    
    const query =
     `  ${scriptInicio} ${scriptAereo} ${scriptServico} ${scriptFim}  ${orderbyClause} `
   
    const result = await request.query(query);
    
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
    //console.log(error.message); 
  }
};

module.exports = {
  getFatura,
  getFaturaById,
  createFatura,
  updateFatura,
  deleteFatura,
  getEmissao,
  getFaturaImpressao,
  getItensFaturaImpressao,
  getRelatoriosAnalitico,
  getRelatoriosSintetico
};
