import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/product.model.js';

dotenv.config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Conectado ao MongoDB');

    await Product.deleteMany({});
    console.log('🧹 Produtos antigos removidos');

    const products = [
      {
        _id: 'prod_stock_petr4',
        name: 'Petrobras PN',
        type: 'STOCK',
        institution: 'B3',
        riskLevel: 'HIGH',
        minInvestmentAmount: 28.75, 
        ticker: 'PETR4',
        sector: 'Energia'
      },
      {
        _id: 'prod_stock_vale3',
        name: 'Vale ON',
        type: 'STOCK',
        institution: 'B3',
        riskLevel: 'MEDIUM',
        minInvestmentAmount: 72.50,
        ticker: 'VALE3',
        sector: 'Mineração'
      },
      {
        _id: 'prod_cdb_itau_110',
        name: 'CDB Itaú 110% CDI',
        type: 'CDB',
        institution: 'Itaú',
        riskLevel: 'LOW',
        minInvestmentAmount: 1000.00,
        rateType: 'CDI',
        rateValue: 110,
        liquidity: 'Diária',
        issuer: 'Banco Itaú',
        maturityDate: new Date('2026-12-31')
      },
      {
        _id: 'prod_fii_hglg11',
        name: 'CSHG Logística',
        type: 'FII',
        institution: 'Credit Suisse',
        riskLevel: 'MEDIUM',
        minInvestmentAmount: 118.90,
        ticker: 'HGLG11',
        sector: 'Logística'
      },
      {
        _id: 'prod_fii_vgir11',
        name: 'Valora RE III',
        type: 'FII',
        institution: 'Valora',
        riskLevel: 'MEDIUM',
        minInvestmentAmount: 9.80, 
        ticker: 'VGIR11',
        sector: 'Papel'
      },
      {
        _id: 'prod_treasury_ipca_2035',
        name: 'Tesouro IPCA+ 2035',
        type: 'TREASURY',
        institution: 'Tesouro Nacional',
        riskLevel: 'LOW',
        minInvestmentAmount: 30.00,
        bondType: 'IPCA',
        indexer: 'IPCA',
        maturityDate: new Date('2035-05-15'),
        couponRate: 6.0
      },
      {
        _id: 'prod_crypto_btc',
        name: 'Bitcoin',
        type: 'CRYPTO',
        institution: 'Blockchain',
        riskLevel: 'AGGRESSIVE',
        minInvestmentAmount: 50.00,
        ticker: 'BTC'
      },
      {
        _id: 'prod_cdb_mauro_120',
        name: 'CDB IF-Mauro 120% CDI',
        type: 'CDB',
        institution: 'IF-Mauro',
        riskLevel: 'LOW',
        minInvestmentAmount: 100.00,
        rateType: 'CDI',
        rateValue: 120,
        liquidity: 'No Maturity',
        issuer: 'IF-Mauro',
        maturityDate: new Date('2027-01-01')
      }
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} produtos inseridos com sucesso!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao rodar seed:', error);
    process.exit(1);
  }
};

seedProducts();