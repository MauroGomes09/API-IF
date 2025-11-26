import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../src/models/product.model.js"; 

dotenv.config();

const seedProducts = async () => {
   try {
      if (!process.env.MONGO_URI) {
         throw new Error("MONGO_URI não definida no .env");
      }

      await mongoose.connect(process.env.MONGO_URI);

      console.log("Conectado ao MongoDB. Limpando produtos antigos...");
      await Product.deleteMany({});

      const products = [
         new Product({
            _id: "prod_cdb_mauro_flex",
            type: "CDB", 
            name: "CDB Flex IF-Mauro",
            institution: "IF-Mauro",
            riskLevel: "LOW",
            rateType: "CDI",
            rateValue: 103,
            maturityDate: new Date("2026-06-30"),
            liquidity: "D+0",
            issuer: "IF-Mauro",
            minInvestmentAmount: 100
         }),
         new Product({
            _id: "prod_cdb_master_118",
            type: "CDB",
            name: "CDB Banco Master 118% CDI",
            institution: "Banco Master",
            riskLevel: "LOW",
            rateType: "CDI",
            rateValue: 118,
            maturityDate: new Date("2027-12-31"),
            liquidity: "No Maturity",
            issuer: "Banco Master",
            minInvestmentAmount: 1000
         }),
         new Product({
            _id: "prod_cdb_itau_daily",
            type: "CDB",
            name: "CDB Itaú Liq. Diária",
            institution: "Itaú",
            riskLevel: "LOW",
            rateType: "CDI",
            rateValue: 92,
            maturityDate: new Date("2025-12-31"),
            liquidity: "D+0",
            issuer: "Itaú Unibanco",
            minInvestmentAmount: 1
         }),

         new Product({
            _id: "prod_stock_petr4",
            type: "STOCK",
            name: "Petrobras PN",
            institution: "B3",
            riskLevel: "HIGH",
            ticker: "PETR4",
            sector: "Energy"
         }),
         new Product({
            _id: "prod_stock_wege3",
            type: "STOCK",
            name: "WEG ON",
            institution: "B3",
            riskLevel: "MEDIUM",
            ticker: "WEGE3",
            sector: "Industrial Goods"
         }),

         new Product({
            _id: "prod_crypto_btc",
            type: "CRYPTO",
            name: "Bitcoin",
            institution: "Blockchain",
            riskLevel: "AGGRESSIVE",
            ticker: "BTC", 
            description: "Reserva de valor digital descentralizada"
         }),

         new Product({
            _id: "prod_fii_hglg11",
            type: "FII",
            name: "CSHG Logística",
            institution: "B3",
            riskLevel: "MEDIUM",
            ticker: "HGLG11",
            issuer: "Credit Suisse", 
            sector: "Logística" 
         }),
         new Product({
            _id: "prod_fii_mxrf11",
            type: "FII",
            name: "Maxi Renda",
            institution: "B3",
            riskLevel: "MEDIUM",
            ticker: "MXRF11",
            issuer: "XP Vista Asset",
            sector: "Papel"
         }),

         new Product({
            _id: "prod_fund_alaska",
            type: "FUNDS",
            name: "Alaska Black FIC FIA",
            institution: "Alaska Asset",
            riskLevel: "HIGH",
            adminFee: 1.8,
            performanceFee: 18.0,
            sector: "Ações Livre", 
            minInvestmentAmount: 500
         }),

         new Product({
            _id: "prod_treasury_selic_2029",
            type: "TREASURY",
            name: "Tesouro Selic 2029",
            institution: "Tesouro Nacional",
            riskLevel: "LOW",
            bondType: "SELIC",
            indexer: "SELIC",
            maturityDate: new Date("2029-03-01"),
            couponRate: 0,
            minInvestmentAmount: 150
         }),

         new Product({
            _id: "prod_treasury_ipca_2035",
            type: "TREASURY",
            name: "Tesouro IPCA+ 2035",
            institution: "Tesouro Nacional",
            riskLevel: "LOW",
            bondType: "IPCA",
            indexer: "IPCA",
            maturityDate: new Date("2035-05-15"),
            couponRate: 5.95, 
            minInvestmentAmount: 30
         })
      ];

      await Product.insertMany(products);
      console.log(`${products.length} produtos inseridos com sucesso!`);

      process.exit(0);

   } catch (error) {
      console.error("Erro ao rodar seed:", error);
      process.exit(1);
   }
};

seedProducts();