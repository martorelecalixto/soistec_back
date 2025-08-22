const { poolPromise } = require('../db');

// Obter dados do aereo 
const getGraficoAereo = async (req, res) => {
  try {
    const { empresa, datainicial, datafinal  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE vendasbilhetes.empresa = @empresa ';

    if (datainicial) {
      request.input('datainicial', datainicial); // Formata a data para incluir hora
      whereClause += ' AND vendasbilhetes.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendasbilhetes.datavenda <= @datafinal';
    }
    
    whereClause += ' GROUP BY YEAR(vendasbilhetes.datavenda), MONTH(vendasbilhetes.datavenda) ORDER BY YEAR(vendasbilhetes.datavenda), MONTH(vendasbilhetes.datavenda) ';

    const query =
     `
          select 
          CASE MONTH(datavenda) WHEN 1 THEN 'jan' 
                                WHEN 2 THEN 'fev' 
                                WHEN 3 THEN 'mar' 
                                WHEN 4 THEN 'abr' 
                                WHEN 5 THEN 'mai' 
                                WHEN 6 THEN 'jun' 
                                WHEN 7 THEN 'jul' 
                                WHEN 8 THEN 'ago' 
                                WHEN 9 THEN 'set' 
                                WHEN 10 THEN 'out' 
                                WHEN 11 THEN 'nov' 
                                WHEN 12 THEN 'dez'
          END  AS mes,
          sum(valortotal) as valor from VendasBilhetes 
            ${whereClause}  `
   //+ '/' + CAST(YEAR(datavenda) AS VARCHAR(4)) 
   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter dados do servico 
const getGraficoServico = async (req, res) => {
  try {
    const { empresa, datainicial, datafinal  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE vendashoteis.empresa = @empresa ';

    if (datainicial) {
      request.input('datainicial', datainicial); // Formata a data para incluir hora
      whereClause += ' AND vendashoteis.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND vendashoteis.datavenda <= @datafinal';
    }
    
    whereClause += ' GROUP BY YEAR(vendashoteis.datavenda), MONTH(vendashoteis.datavenda) ORDER BY YEAR(vendashoteis.datavenda), MONTH(vendashoteis.datavenda) ';

    const query =
     `
          select 
          CASE MONTH(datavenda) WHEN 1 THEN 'jan' 
                                WHEN 2 THEN 'fev' 
                                WHEN 3 THEN 'mar' 
                                WHEN 4 THEN 'abr' 
                                WHEN 5 THEN 'mai' 
                                WHEN 6 THEN 'jun' 
                                WHEN 7 THEN 'jul' 
                                WHEN 8 THEN 'ago' 
                                WHEN 9 THEN 'set' 
                                WHEN 10 THEN 'out' 
                                WHEN 11 THEN 'nov' 
                                WHEN 12 THEN 'dez'
          END AS mes,
          sum(valortotal) as valor from vendashoteis 
            ${whereClause}  `
   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter dados do pagar 
const getGraficoPagar = async (req, res) => {
  try {
    const { empresa, datainicial, datafinal  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE titulospagar.empresa = @empresa ';

    if (datainicial) {
      request.input('datainicial', datainicial); // Formata a data para incluir hora
      whereClause += ' AND titulospagar.dataemissao >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND titulospagar.dataemissao <= @datafinal';
    }
    
    whereClause += '  GROUP BY YEAR(titulospagar.dataemissao), MONTH(titulospagar.dataemissao) ORDER BY YEAR(titulospagar.dataemissao), MONTH(titulospagar.dataemissao)  ';

    const query =
     `
          select 
          CASE MONTH(dataemissao) WHEN 1 THEN 'jan' 
                                WHEN 2 THEN 'fev' 
                                WHEN 3 THEN 'mar' 
                                WHEN 4 THEN 'abr' 
                                WHEN 5 THEN 'mai' 
                                WHEN 6 THEN 'jun' 
                                WHEN 7 THEN 'jul' 
                                WHEN 8 THEN 'ago' 
                                WHEN 9 THEN 'set' 
                                WHEN 10 THEN 'out' 
                                WHEN 11 THEN 'nov' 
                                WHEN 12 THEN 'dez'
          END as mes,
          sum(valor) as valor from titulospagar 
            ${whereClause}  `
   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter dados do receber 
const getGraficoReceber = async (req, res) => {
  try {
    const { empresa, datainicial, datafinal  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClause = 'WHERE titulosreceber.empresa = @empresa  ';

    if (datainicial) {
      request.input('datainicial', datainicial); // Formata a data para incluir hora
      whereClause += ' AND titulosreceber.dataemissao >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClause += ' AND titulosreceber.dataemissao <= @datafinal';
    }
    
    whereClause += '  GROUP BY YEAR(titulosreceber.dataemissao), MONTH(titulosreceber.dataemissao) ORDER BY YEAR(titulosreceber.dataemissao), MONTH(titulosreceber.dataemissao)  ';

    const query =
     `
          select 
          CASE MONTH(dataemissao) WHEN 1 THEN 'jan' 
                                WHEN 2 THEN 'fev' 
                                WHEN 3 THEN 'mar' 
                                WHEN 4 THEN 'abr' 
                                WHEN 5 THEN 'mai' 
                                WHEN 6 THEN 'jun' 
                                WHEN 7 THEN 'jul' 
                                WHEN 8 THEN 'ago' 
                                WHEN 9 THEN 'set' 
                                WHEN 10 THEN 'out' 
                                WHEN 11 THEN 'nov' 
                                WHEN 12 THEN 'dez'
          END as mes,
          sum(valor) as valor from titulosreceber 
            ${whereClause}  `
   const result = await request.query(query);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obter dados dos totais 
const getTotais = async (req, res) => {
  try {
    //console.log('getTotais');
    const { empresa, datainicial, datafinal  } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    //console.log('Empresa:', empresa);
    //console.log('Data Inicial:', datainicial);
    //console.log('Data Final:', datafinal);

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);
    request.input('datainicial', datainicial); // Formata a data para incluir hora
    request.input('datafinal', datafinal);
  
    // Parâmetros opcionais
    let scriptClause = ' select sum(tabela.totalAereo)  as totalAereo, sum(tabela.totalServico) as totalServico, sum(tabela.totalPagar) as totalPagar, sum(tabela.totalReceber) as totalReceber from( ';
    scriptClause += ' select sum(valortotal) as totalAereo, 0 as totalServico, 0 as totalPagar, 0 as totalReceber from VendasBilhetes ';
    scriptClause += ' WHERE vendasbilhetes.empresa = @empresa  ';
    if (datainicial) {
      scriptClause += ' AND vendasbilhetes.datavenda >= @datainicial ';
    }
    if (datafinal) {
      scriptClause += ' AND vendasbilhetes.datavenda <= @datafinal ';
    }
    scriptClause += ' UNION ';

    scriptClause += ' select 0 as totalAereo, sum(valortotal) as totalServico, 0 as totalPagar, 0 as totalReceber from Vendashoteis ';
    scriptClause += ' WHERE Vendashoteis.empresa = @empresa  ';
    if (datainicial) {
      scriptClause += ' AND Vendashoteis.datavenda >= @datainicial ';
    }
    if (datafinal) {
      scriptClause += ' AND Vendashoteis.datavenda <= @datafinal ';
    }

    scriptClause += ' UNION ';

    scriptClause += ' select 0 as totalAereo, 0 as totalServico, sum(valor) as totalPagar, 0 as totalReceber from titulospagar ';
    scriptClause += ' WHERE titulospagar.empresa = @empresa  ';
    if (datainicial) {
      scriptClause += ' AND titulospagar.dataemissao >= @datainicial ';
    }
    if (datafinal) {
      scriptClause += ' AND titulospagar.dataemissao <= @datafinal ';
    }

    scriptClause += ' UNION ';

    scriptClause += ' select 0 as totalAereo, 0 as totalServico, 0 as totalPagar, sum(valor) as totalReceber from titulosreceber ';
    scriptClause += ' WHERE titulosreceber.empresa = @empresa  ';
    if (datainicial) {
      scriptClause += ' AND titulosreceber.dataemissao >= @datainicial ';
    }
    if (datafinal) {
      scriptClause += ' AND titulosreceber.dataemissao <= @datafinal ';
    }

    scriptClause += ' ) as tabela ';
    
    //console.log('Script Clause:', scriptClause);

    const query =
     `  ${scriptClause}  `
   const result = await request.query(query);
   //console.log(result.recordset);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getGraficoAereo,
  getGraficoServico,
  getGraficoPagar,
  getGraficoReceber,
  getTotais
};
