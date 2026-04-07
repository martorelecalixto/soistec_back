const { poolPromise } = require('../db');
const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');
//const { poolPromise } = require('../database');


const getRelatorioPlanoConta = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal,
            vencimentoinicial, vencimentofinal, idformapagamento, idgrupo,
            situacao, tipo
     } = req.query;
    // console.log('ENTROU');
    // console.log(req.query);

    const sql = require('mssql');
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }    

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    let orderClause = '';
    let script = '';

    // Parâmetros opcionais
    let whereClauseRec = ' WHERE titulosreceber.empresa = @empresa AND titulosreceber.id > 0 ';
    let whereClausePag = ' WHERE titulospagar.empresa = @empresa AND titulospagar.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClauseRec += ' AND titulosreceber.idfilial = @idfilial';
      whereClausePag += ' AND titulospagar.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClauseRec += ' AND titulosreceber.identidade = @identidade';
      whereClausePag += ' AND titulospagar.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClauseRec += ' AND titulosreceber.idmoeda = @idmoeda';
      whereClausePag += ' AND titulospagar.idmoeda = @idmoeda';
    }
    
    if (idformapagamento) {
      request.input('idformapagamento', idformapagamento);
      whereClauseRec += ' AND titulosreceber.idformapagamento = @idformapagamento';
      whereClausePag += ' AND titulospagar.idformapagamento = @idformapagamento';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClauseRec += ' AND titulosreceber.dataemissao >= @datainicial';
      whereClausePag += ' AND titulospagar.dataemissao >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClauseRec += ' AND titulosreceber.dataemissao <= @datafinal';
      whereClausePag += ' AND titulospagar.dataemissao <= @datafinal';
    }

    if (vencimentoinicial) {
      request.input('vencimentoinicial', vencimentoinicial);
      whereClauseRec += ' AND titulosreceber.datavencimento >= @vencimentoinicial';
      whereClausePag += ' AND titulospagar.datavencimento >= @vencimentoinicial';
    }
    
    if (vencimentofinal) {
      request.input('vencimentofinal', vencimentofinal);
      whereClauseRec += ' AND titulosreceber.datavencimento <= @vencimentofinal';
      whereClausePag += ' AND titulospagar.datavencimento <= @vencimentofinal';
    }

    if(situacao == 'ABERTO'){
      whereClauseRec += ' AND titulosreceber.valor > titulosreceber.valorpago '
      whereClausePag += ' AND titulospagar.valor > titulospagar.valorpago '
    }
    if(situacao == 'QUITADO'){
      whereClauseRec += ' AND titulosreceber.valor = titulosreceber.valorpago '
      whereClausePag += ' AND titulospagar.valor = titulospagar.valorpago '
    }

    orderClause += ' ORDER BY TABELA.descricao '

    if(tipo == 'Emissao'){
    script =
      `
         SELECT TABELA.entidade, TABELA.valor, TABELA.dataemissao 
         FROM( 
         SELECT PlanoConta.nome as entidade, TitulosReceber.dataemissao,
                 SUM(TitulosReceber.Valor) AS valor, SUM(TitulosReceber.ValorPago) AS valorpago,   
                 SUM(TitulosReceber.DescontoPago) AS valordesconto, SUM(TitulosReceber.JuroPago) AS valorjuro  
         FROM            TitulosReceber INNER JOIN 
                                  Filiais ON TitulosReceber.IdFilial = Filiais.IdFilial INNER JOIN 
                                  FormaPagamento ON TitulosReceber.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN 
                                  Entidades ON TitulosReceber.IdEntidade = Entidades.IdEntidade INNER JOIN 
                                  Moeda ON TitulosReceber.IdMoeda = Moeda.IdMoeda INNER JOIN 
                                  PlanoConta ON TitulosReceber.IdPlanoConta = PlanoConta.IdPlanoConta 

         ${whereClauseRec}    

        GROUP BY TitulosReceber.dataemissao,  PlanoConta.nome
        
        UNION
        
         SELECT PlanoConta.nome as entidade, TitulosPagar.dataemissao,
                 (-1* SUM(TitulosPagar.Valor)) AS valor, (-1* SUM(TitulosPagar.ValorPago)) AS valorpago,   
                 (-1* SUM(TitulosPagar.DescontoPago)) AS valordesconto, (-1* SUM(TitulosPagar.JuroPago)) AS valorjuro  
         FROM            TitulosPagar INNER JOIN 
                                  Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial INNER JOIN 
                                  FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN 
                                  Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade INNER JOIN 
                                  Moeda ON TitulosPagar.IdMoeda = Moeda.IdMoeda INNER JOIN 
                                  PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta  
                                
        ${whereClausePag}  

        GROUP BY PlanoConta.nome, TitulosPagar.dataemissao
        
         ) AS TABELA ORDER BY TABELA.dataemissao
 
       `
    }else
    if(tipo == 'Vencimento'){
    script =
      `
         SELECT TABELA.entidade, TABELA.valor, TABELA.dataemissao 
         FROM( 
         SELECT PlanoConta.nome as entidade, TitulosReceber.datavencimento AS dataemissao,
                 SUM(TitulosReceber.Valor) AS valor, SUM(TitulosReceber.ValorPago) AS valorpago,   
                 SUM(TitulosReceber.DescontoPago) AS valordesconto, SUM(TitulosReceber.JuroPago) AS valorjuro  
         FROM            TitulosReceber INNER JOIN 
                                  Filiais ON TitulosReceber.IdFilial = Filiais.IdFilial INNER JOIN 
                                  FormaPagamento ON TitulosReceber.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN 
                                  Entidades ON TitulosReceber.IdEntidade = Entidades.IdEntidade INNER JOIN 
                                  Moeda ON TitulosReceber.IdMoeda = Moeda.IdMoeda INNER JOIN 
                                  PlanoConta ON TitulosReceber.IdPlanoConta = PlanoConta.IdPlanoConta 

         ${whereClauseRec}    

        GROUP BY TitulosReceber.datavencimento,  PlanoConta.nome
        
        UNION
        
         SELECT PlanoConta.nome as entidade, TitulosPagar.datavencimento AS dataemissao,
                 (-1* SUM(TitulosPagar.Valor)) AS valor, (-1* SUM(TitulosPagar.ValorPago)) AS valorpago,   
                 (-1* SUM(TitulosPagar.DescontoPago)) AS valordesconto, (-1* SUM(TitulosPagar.JuroPago)) AS valorjuro  
         FROM            TitulosPagar INNER JOIN 
                                  Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial INNER JOIN 
                                  FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN 
                                  Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade INNER JOIN 
                                  Moeda ON TitulosPagar.IdMoeda = Moeda.IdMoeda INNER JOIN 
                                  PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta  
                                
        ${whereClausePag}  

        GROUP BY PlanoConta.nome, TitulosPagar.datavencimento
        
         ) AS TABELA ORDER BY TABELA.dataemissao
 
       `
    }

       const query = 
     `  ${script} `

   const result = await request.query(query);
   //console.log(result.recordset);
   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getRelatorioPlanoContaSintetico = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal,
            vencimentoinicial, vencimentofinal, idformapagamento, idgrupo,
            situacao
     } = req.query;

    const sql = require('mssql');
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }    

    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    let orderClause = '';
    let script = '';

    // Parâmetros opcionais
    let whereClauseRec = ' WHERE titulosreceber.empresa = @empresa AND titulosreceber.id > 0 ';
    let whereClausePag = ' WHERE titulospagar.empresa = @empresa AND titulospagar.id > 0 ';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClauseRec += ' AND titulosreceber.idfilial = @idfilial';
      whereClausePag += ' AND titulospagar.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClauseRec += ' AND titulosreceber.identidade = @identidade';
      whereClausePag += ' AND titulospagar.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClauseRec += ' AND titulosreceber.idmoeda = @idmoeda';
      whereClausePag += ' AND titulospagar.idmoeda = @idmoeda';
    }
    
    if (idformapagamento) {
      request.input('idformapagamento', idformapagamento);
      whereClauseRec += ' AND titulosreceber.idformapagamento = @idformapagamento';
      whereClausePag += ' AND titulospagar.idformapagamento = @idformapagamento';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClauseRec += ' AND titulosreceber.dataemissao >= @datainicial';
      whereClausePag += ' AND titulospagar.dataemissao >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClauseRec += ' AND titulosreceber.dataemissao <= @datafinal';
      whereClausePag += ' AND titulospagar.dataemissao <= @datafinal';
    }

    if (vencimentoinicial) {
      request.input('vencimentoinicial', vencimentoinicial);
      whereClauseRec += ' AND titulosreceber.datavencimento >= @vencimentoinicial';
      whereClausePag += ' AND titulospagar.datavencimento >= @vencimentoinicial';
    }
    
    if (vencimentofinal) {
      request.input('vencimentofinal', vencimentofinal);
      whereClauseRec += ' AND titulosreceber.datavencimento <= @vencimentofinal';
      whereClausePag += ' AND titulospagar.datavencimento <= @vencimentofinal';
    }

    if(situacao == 'ABERTO'){
      whereClauseRec += ' AND titulosreceber.valor > titulosreceber.valorpago '
      whereClausePag += ' AND titulospagar.valor > titulospagar.valorpago '
    }
    if(situacao == 'QUITADO'){
      whereClauseRec += ' AND titulosreceber.valor = titulosreceber.valorpago '
      whereClausePag += ' AND titulospagar.valor = titulospagar.valorpago '
    }

    orderClause += ' ORDER BY TABELA.descricao '

    script =
      `
         SELECT TABELA.observacao, TABELA.descricao, TABELA.planoconta, TABELA.valor, TABELA.valorpago, TABELA.valordesconto, TABELA.valorjuro 
         FROM( 
         SELECT REPLICATE('-', LEN(PlanoConta.estrutura)) AS observacao, PlanoConta.estrutura as descricao,  PlanoConta.nome as planoconta, 
                 SUM(TitulosReceber.Valor) AS valor, SUM(TitulosReceber.ValorPago) AS valorpago,   
                 SUM(TitulosReceber.DescontoPago) AS valordesconto, SUM(TitulosReceber.JuroPago) AS valorjuro  
         FROM            TitulosReceber INNER JOIN 
                                  Filiais ON TitulosReceber.IdFilial = Filiais.IdFilial INNER JOIN 
                                  FormaPagamento ON TitulosReceber.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN 
                                  Entidades ON TitulosReceber.IdEntidade = Entidades.IdEntidade INNER JOIN 
                                  Moeda ON TitulosReceber.IdMoeda = Moeda.IdMoeda INNER JOIN 
                                  PlanoConta ON TitulosReceber.IdPlanoConta = PlanoConta.IdPlanoConta 

         ${whereClauseRec}    

        GROUP BY PlanoConta.estrutura,  PlanoConta.nome
        
        UNION
        
         SELECT REPLICATE('-', LEN(PlanoConta.estrutura)) AS observacao, PlanoConta.estrutura as descricao,  PlanoConta.nome as planoconta,
                 (-1* SUM(TitulosPagar.Valor)) AS valor, (-1* SUM(TitulosPagar.ValorPago)) AS valorpago,   
                 (-1* SUM(TitulosPagar.DescontoPago)) AS valordesconto, (-1* SUM(TitulosPagar.JuroPago)) AS valorjuro  
         FROM            TitulosPagar INNER JOIN 
                                  Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial INNER JOIN 
                                  FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN 
                                  Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade INNER JOIN 
                                  Moeda ON TitulosPagar.IdMoeda = Moeda.IdMoeda INNER JOIN 
                                  PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta  
                                
        ${whereClausePag}  

        GROUP BY PlanoConta.estrutura,  PlanoConta.nome 
        
        UNION
        
        SELECT REPLICATE('-', LEN(PlanoContaPai.estrutura)) AS observacao, PlanoContaPai.estrutura as descricao,  PlanoContaPai.nome as planoconta, 
                SUM(TitulosReceber.Valor) AS valor, SUM(TitulosReceber.ValorPago) AS valorpago,   
                SUM(TitulosReceber.DescontoPago) AS valordesconto, SUM(TitulosReceber.JuroPago) AS valorjuro  
        FROM            TitulosReceber INNER JOIN 
                                Filiais ON TitulosReceber.IdFilial = Filiais.IdFilial INNER JOIN 
                                FormaPagamento ON TitulosReceber.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN 
                                Entidades ON TitulosReceber.IdEntidade = Entidades.IdEntidade INNER JOIN 
                                Moeda ON TitulosReceber.IdMoeda = Moeda.IdMoeda INNER JOIN 
                                PlanoConta ON TitulosReceber.IdPlanoConta = PlanoConta.IdPlanoConta INNER JOIN 
                                PlanoConta PlanoContaPai ON PlanoConta.IdPlanoContaPai = PlanoContaPai.IdPlanoConta 
        
        ${whereClauseRec} 

        GROUP BY PlanoContaPai.estrutura,  PlanoContaPai.nome 
        
        UNION
        
        SELECT REPLICATE('-', LEN(PlanoContaPai.estrutura)) AS observacao, PlanoContaPai.estrutura as descricao,  PlanoContaPai.nome as planoconta, 
                (-1* SUM(TitulosPagar.Valor)) AS valor, (-1* SUM(TitulosPagar.ValorPago)) AS valorpago,   
                (-1* SUM(TitulosPagar.DescontoPago)) AS valordesconto, (-1* SUM(TitulosPagar.JuroPago)) AS valorjuro  
        FROM            TitulosPagar INNER JOIN 
                                Filiais ON TitulosPagar.IdFilial = Filiais.IdFilial INNER JOIN 
                                FormaPagamento ON TitulosPagar.IdFormaPagamento = FormaPagamento.IdFormaPagamento INNER JOIN 
                                Entidades ON TitulosPagar.IdEntidade = Entidades.IdEntidade INNER JOIN 
                                Moeda ON TitulosPagar.IdMoeda = Moeda.IdMoeda INNER JOIN 
                                PlanoConta ON TitulosPagar.IdPlanoConta = PlanoConta.IdPlanoConta INNER JOIN 
                                PlanoConta PlanoContaPai ON PlanoConta.IdPlanoContaPai = PlanoContaPai.IdPlanoConta 

        ${whereClausePag}
                                
        GROUP BY PlanoContaPai.estrutura,  PlanoContaPai.nome 
        
         ) AS TABELA ORDER BY TABELA.descricao
 
       `

       const query = 
     `  ${script} `

   const result = await request.query(query);

   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getRelatorioVendas = async (req, res) => {
  try {
    const { empresa, idfilial, identidade, idmoeda, datainicial, datafinal,
      vencimentoinicial, vencimentofinal, idformapagamento, idoperadora, tipo
     } = req.query;
    const sql = require('mssql');
    // Verifica se o parâmetro 'empresa' foi fornecido
    if (!empresa) {
      return res.status(400).json({ success: false, message: 'O parâmetro "empresa" é obrigatório.' });
    }
    
    //console.log(req.query);
    // Parâmetros obrigatórios
    const pool = await poolPromise;
    const request = pool.request();

    request.input('empresa', empresa);

    // Parâmetros opcionais
    let whereClauseAereo = 'WHERE vendasbilhetes.empresa = @empresa AND vendasbilhetes.id > 0 ';
    let whereClauseServico = 'WHERE vendashoteis.empresa = @empresa AND vendashoteis.id > 0 ';
    let orderClause = '';
    let groupClauseAereo = '';
    let groupClauseServico = '';

    // Filtros opcionais
    if (idfilial) {
      request.input('idfilial', idfilial);
      whereClauseAereo += ' AND vendasbilhetes.idfilial = @idfilial';
      whereClauseServico += ' AND vendashoteis.idfilial = @idfilial';
    }

    if (identidade) {
      request.input('identidade', identidade);
      whereClauseAereo += ' AND vendasbilhetes.identidade = @identidade';
      whereClauseServico += ' AND vendashoteis.identidade = @identidade';
    }

    if (idmoeda) {
      request.input('idmoeda', idmoeda);
      whereClauseAereo += ' AND vendasbilhetes.idmoeda = @idmoeda';
      whereClauseServico += ' AND vendashoteis.idmoeda = @idmoeda';
    }
    
    if (idformapagamento) {
      request.input('idformapagamento', idformapagamento);
      whereClauseAereo += ' AND vendasbilhetes.idformapagamento = @idformapagamento';
      whereClauseServico += ' AND vendashoteis.idformapagamento = @idformapagamento';
    }

    if (datainicial) {
      request.input('datainicial', datainicial);
      whereClauseAereo += ' AND vendasbilhetes.datavenda >= @datainicial';
      whereClauseServico += ' AND vendashoteis.datavenda >= @datainicial';
    }
    
    if (datafinal) {
      request.input('datafinal', datafinal);
      whereClauseAereo += ' AND vendasbilhetes.datavenda <= @datafinal';
      whereClauseServico += ' AND vendashoteis.datavenda <= @datafinal';
    }

    if (vencimentoinicial) {
      request.input('vencimentoinicial', vencimentoinicial);
      whereClauseAereo += ' AND vendasbilhetes.datavencimento >= @vencimentoinicial';
      whereClauseServico += ' AND vendashoteis.datavencimento >= @vencimentoinicial';
    }
    
    if (vencimentofinal) {
      request.input('vencimentofinal', vencimentofinal);
      whereClauseAereo += ' AND vendasbilhetes.datavencimento <= @vencimentofinal';
      whereClauseServico += ' AND vendashoteis.datavencimento <= @vencimentofinal';
    }

    if (idoperadora) {
      request.input('idoperadora', idoperadora);
      whereClauseAereo += ' AND ItensVendaBilhete.idoperadora = @idoperadora';
      whereClauseServico += ' AND ItensVendaHotel.idoperadora = @idoperadora';
    }

    if(tipo == 'Cliente Vencimento'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		Entidades_3.nome, vendasbilhetes.datavencimento  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		Entidades_3.nome, vendashoteis.datavencimento  ';
    }else
    if(tipo == 'Cliente Emissao'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		Entidades_3.nome, vendasbilhetes.datavenda  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		Entidades_3.nome, vendashoteis.datavenda  ';
    }else
    if(tipo == 'Venda Emissao'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		vendasbilhetes.datavenda  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		vendashoteis.datavenda  ';
    }else
    if(tipo == 'Venda Vencimento'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		vendasbilhetes.datavencimento  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		vendashoteis.datavencimento  ';
    }else
    if(tipo == 'Operadora Emissao'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		Entidades_4.nome, vendasbilhetes.datavenda  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		Entidades_4.nome, vendashoteis.datavenda  ';
    }else
    if(tipo == 'Operadora Vencimento'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		Entidades_4.nome, vendasbilhetes.datavencimento  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		Entidades_4.nome, vendashoteis.datavencimento  ';
    }else
    if(tipo == 'Vendedor Emissao'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		Entidades_1.nome, vendasbilhetes.datavenda  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		Entidades_1.nome, vendashoteis.datavenda  ';
    }else
    if(tipo == 'Vendedor Vencimento'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		Entidades_1.nome, vendasbilhetes.datavencimento  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		Entidades_1.nome, vendashoteis.datavencimento  ';
    }else
    if(tipo == 'Emissor Emissao'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		Entidades_2.nome, vendasbilhetes.datavenda  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		Entidades_2.nome, vendashoteis.datavenda  ';
    }else
    if(tipo == 'Emissor Vencimento'){
    groupClauseAereo +=  ' GROUP BY  ' +
                    '		Entidades_2.nome, vendasbilhetes.datavencimento  ';
    groupClauseServico +=  ' GROUP BY  ' +
                    '		Entidades_2.nome, vendashoteis.datavencimento  ';
    }


    if((tipo == 'Cliente Emissao')||(tipo == 'Cliente Vencimento'))
        orderClause += ' ORDER BY 2, 1 '
    else
    if((tipo == 'Venda Emissao')||(tipo == 'Venda Vencimento'))
      orderClause += ' ORDER BY 2, 1 '
    else
    if((tipo == 'Operadora Emissao')||(tipo == 'Operadora Vencimento'))
      orderClause += ' ORDER BY 2, 1 '
    else
    if((tipo == 'Vendedor Emissao')||(tipo == 'Vendedor Vencimento'))
      orderClause += ' ORDER BY 2, 1 '
    else
    if((tipo == 'Emissor Emissao')||(tipo == 'Emissor Vencimento'))
      orderClause += ' ORDER BY 2, 1 '
    else
    if((tipo == 'Plano Conta Emissao')||(tipo == 'Plano Conta Vencimento'))
      orderClause += ' ORDER BY 2, 1 ';

    //console.log(tipo);
    let query = '';
    if(tipo == 'Venda Vencimento'){

     query =
     `
            SELECT        Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT        'AEREO' AS entidade, vendasbilhetes.datavencimento AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT        'SERVICO' AS entidade, vendashoteis.datavencimento AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
        
        `
    }else
    if(tipo == 'Venda Emissao'){
     query =
     `
            SELECT        Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT        'AEREO' AS entidade, vendasbilhetes.datavenda AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT        'SERVICO' AS entidade, vendashoteis.datavenda AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
       
        `
    }else
    if(tipo == 'Cliente Vencimento'){

     query =
     `
            SELECT        Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT      Entidades_3.nome AS entidade, vendasbilhetes.datavencimento AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT      Entidades_3.nome AS entidade, vendashoteis.datavencimento AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
        
        `
    }else
    if(tipo == 'Cliente Emissao'){
     query =
     `
            SELECT       Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT      Entidades_3.nome AS entidade, vendasbilhetes.datavenda AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT      Entidades_3.nome AS entidade, vendashoteis.datavenda AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
       
        `
    }else
    if(tipo == 'Vendedor Emissao'){
     query =
     `
            SELECT       Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT      Entidades_1.nome AS entidade, vendasbilhetes.datavenda AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT      Entidades_1.nome AS entidade, vendashoteis.datavenda AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
       
        `
    }else
    if(tipo == 'Vendedor Vencimento'){
     query =
     `
            SELECT       Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT      Entidades_1.nome AS entidade, vendasbilhetes.datavencimento AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT      Entidades_1.nome AS entidade, vendashoteis.datavencimento AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
       
        `
    }else
    if(tipo == 'Emissor Emissao'){
     query =
     `
            SELECT       Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT      Entidades_2.nome AS entidade, vendasbilhetes.datavenda AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT      Entidades_2.nome AS entidade, vendashoteis.datavenda AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
       
        `
    }else
    if(tipo == 'Emissor Vencimento'){
     query =
     `
            SELECT       Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT      Entidades_2.nome AS entidade, vendasbilhetes.datavencimento AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT      Entidades_2.nome AS entidade, vendashoteis.datavencimento AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
       
        `
        //console.log(query);
    }else
    if(tipo == 'Operadora Emissao'){
     query =
     `
            SELECT       Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT      Entidades_4.nome AS entidade, vendasbilhetes.datavenda AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT      Entidades_4.nome AS entidade, vendashoteis.datavenda AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
        `
    }else
    if(tipo == 'Operadora Vencimento'){
     query =
     `
            SELECT       Tabela.entidade, Tabela.dataemissao,
                          SUM(ISNULL(Tabela.valorpago,0)) AS valorpago,
                          SUM(ISNULL(Tabela.valor,0)) as valor,
                          SUM(ISNULL(Tabela.valortaxa,0)) as valortaxa,
                          SUM(ISNULL(Tabela.valorservico,0)) as valorservico,
                          SUM(ISNULL(Tabela.valoroutros,0)) as valoroutros		
              FROM(
                  SELECT      Entidades_4.nome AS entidade, vendasbilhetes.datavencimento AS dataemissao,
                                SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                                SUM(ISNULL(ItensVendaBilhete.ValorBilhete,0)) as valor,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaBilhete,0)) as valortaxa,
                                SUM(ISNULL(ItensVendaBilhete.ValorTaxaServico,0)) as valorservico,
                                SUM(ISNULL(ItensVendaBilhete.ValorAssento,0)) as valoroutros		
                            FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                                    Moeda RIGHT OUTER JOIN
                                                    Entidades AS entidades_2 RIGHT OUTER JOIN
                                                    VendasBilhetes INNER JOIN
                                                    Entidades AS Entidades_3 ON VendasBilhetes.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                                    Faturas LEFT OUTER JOIN
                                                    TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON VendasBilhetes.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = VendasBilhetes.IdEmissor ON Moeda.IdMoeda = VendasBilhetes.IdMoeda ON 
                                                    entidades_1.IdEntidade = VendasBilhetes.IdVendedor LEFT OUTER JOIN
                                                    Filiais ON VendasBilhetes.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                                    Entidades INNER JOIN
                                                    ItensVendaBilhete ON Entidades.IdEntidade = ItensVendaBilhete.IdCiaAerea INNER JOIN
                                                    Entidades AS Entidades_4 ON ItensVendaBilhete.IdOperadora = Entidades_4.IdEntidade ON VendasBilhetes.IdVenda = ItensVendaBilhete.IdVenda LEFT OUTER JOIN
                                                    FormaPagamento ON VendasBilhetes.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                                    RecibosReceber ON VendasBilhetes.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                                    TitulosReceber ON VendasBilhetes.IdVenda = TitulosReceber.IdVendaBilhete LEFT OUTER JOIN
                                                    Grupos ON VendasBilhetes.IdGrupo = Grupos.Id
          ${whereClauseAereo}  ${groupClauseAereo} 

          UNION                    

          SELECT      Entidades_4.nome AS entidade, vendashoteis.datavencimento AS dataemissao,
                        SUM(ISNULL(titulosreceber.valorpago,0)) AS valorpago,
                        SUM(ISNULL(ItensVendaHotel.ValorHotel,0)) as valor,
                        SUM(ISNULL(ItensVendaHotel.ValorTaxa,0)) as valortaxa,
                        SUM(ISNULL(ItensVendaHotel.ValorExtras,0)) as valorservico,
                        SUM(ISNULL(ItensVendaHotel.ValorOutros,0)) as valoroutros		
                    FROM            Entidades AS entidades_1 RIGHT OUTER JOIN
                                            Moeda RIGHT OUTER JOIN
                                            Entidades AS entidades_2 RIGHT OUTER JOIN
                                            vendashoteis INNER JOIN
                                            Entidades AS Entidades_3 ON vendashoteis.IdEntidade = Entidades_3.IdEntidade LEFT OUTER JOIN
                                            Faturas LEFT OUTER JOIN
                                            TitulosReceber AS TitulosReceber_1 ON Faturas.IdFatura = TitulosReceber_1.IdFatura ON vendashoteis.IdFatura = Faturas.IdFatura ON entidades_2.IdEntidade = vendashoteis.IdEmissor ON Moeda.IdMoeda = vendashoteis.IdMoeda ON 
                                            entidades_1.IdEntidade = vendashoteis.IdVendedor LEFT OUTER JOIN
                                            Filiais ON vendashoteis.IdFilial = Filiais.IdFilial LEFT OUTER JOIN
                                            Entidades INNER JOIN
                                            ItensVendaHotel ON Entidades.IdEntidade = ItensVendaHotel.IdFornecedor INNER JOIN
                                            Entidades AS Entidades_4 ON ItensVendaHotel.IdOperadora = Entidades_4.IdEntidade ON vendashoteis.IdVenda = ItensVendaHotel.IdVenda LEFT OUTER JOIN
                                            FormaPagamento ON vendashoteis.IdFormaPagamento = FormaPagamento.IdFormaPagamento LEFT OUTER JOIN
                                            RecibosReceber ON vendashoteis.IdReciboReceber = RecibosReceber.IdRecibo LEFT OUTER JOIN
                                            TitulosReceber ON vendashoteis.IdVenda = TitulosReceber.IdVendaHotel LEFT OUTER JOIN
                                            Grupos ON vendashoteis.IdGrupo = Grupos.Id          

          ${whereClauseServico}  ${groupClauseServico} 

          ) AS Tabela
            GROUP BY Tabela.entidade, Tabela.dataemissao
              ${orderClause}
       
        `
    }
   //console.log(query);
   const result = await request.query(query);
   //console.log('DATA::', datainicial, datafinal);  
   //console.log('result::', result.recordset);

   res.json(result.recordset);    
  } catch (error) {
    res.status(500).send(error.message);
  }
};


module.exports = {
  getRelatorioPlanoConta,
  getRelatorioPlanoContaSintetico,
  getRelatorioVendas
};
