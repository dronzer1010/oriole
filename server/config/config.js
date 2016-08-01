if(process.env.NODE_ENV === 'develop')
{
  console.log("###using development envoirenemt###");
  module.exports = {
      server: {
              host: '0.0.0.0',
              port: process.env.PORT || 3000
      },
      database: {
          host: '192.99.101.211',
          port: '27017',
          db: 'expaus-dev',
          username: 'prodDBMongo',
          password: 'ExpausTokyoVen',
          url: 'mongodb://prodDBMongo:ExpausTokyoVen@192.99.101.211:27017/expaus-dev?authMechanism=SCRAM-SHA-1&authSource=expaus-dev'
      },
       instagramConfig: {
          clientID: '900529e381c34d039dfa0fb9c0022ea6',
          clientSecret: 'fd9846a7eb2c40c8ab1622b2154f07d3',
          followers: 1,
          testUserName: 'hayato_1013'
      },
      url: {
          backendUrl: 'http://lxgic-newapp.herokuapp.com',
          basePath: 'http://localhost:3000',
      },
      adminDetails: {
          email: "info@expaus.in",
          user: "Admin",
          password: "connekt0701"
      },
      configMailer: {
          senderUser: 'support@expaus.in',
          senderPass: 'connekt-1010',
          from: 'account@gmail.com'
      },
      paypalConfig: {
           userId:    'hirumakenta-facilitator_api1.outlook.jp',
           password:  'U7PHK9F55PBXTXUX',
           signature: 'AFcWxV21C7fd0v3bYYYRCpSSRl31AafRGXS-av9ViPtrX5IWOHaCs6Oy',
           sandbox:   true 
      },
      redisConfig: {},
      cloudinary:{ 
        cloud_name: 'kenhiru', 
        api_key: '812136389122935', 
        api_secret: '_ovqye1yEbry8sHmQnpcR6nXRbU' 
      }
  };
}

if(process.env.NODE_ENV === 'staging')
{
  console.log("###using staging envoirenemt###");
  module.exports = {
      server: {
              host: '0.0.0.0',
              port: process.env.PORT || 3001
      },
      database: {
          host: 'mongodb-devel',
          port: '27017',
          db: 'expaus-dev',
          username: 'prodDBMongo',
          password: 'ExpausTokyoVen',
          url: 'mongodb://prodDBMongo:ExpausTokyoVen@'+process.env.MONGODB_PORT_27017_TCP_ADDR+':'+process.env.MONGODB_PORT_27017_TCP_PORT+'/expaus?authMechanism=SCRAM-SHA-1&authSource=expaus-dev'
      },
       instagramConfig: {
          clientID: 'e3673c02358949c98f5bde59e71b03e2',
          clientSecret: '5edeb99f27cd4d8c8248ad6f08425b5d',
          followers: 2,
          testUserName: 'hayato_1013'
      },
      url: {
          backendUrl: 'http://lxgic-newapp.herokuapp.com',
          basePath: 'http://expaustest.in:8080',
      },
      adminDetails: {
          email: "info@expaus.in",
          user: "Admin",
          password: "connekt0701"
      },
      configMailer: {
          senderUser: 'support@expaus.in',
          senderPass: 'connekt-1010',
          from: 'account@gmail.com'
      },
      paypalConfig: {
           userId:    'hirumakenta-facilitator_api1.outlook.jp',
           password:  'U7PHK9F55PBXTXUX',
           signature: 'AFcWxV21C7fd0v3bYYYRCpSSRl31AafRGXS-av9ViPtrX5IWOHaCs6Oy',
           sandbox:   true 
      },
      redisConfig: {
        port: '6379',
        host: 'redis',
        options: {
          no_ready_check: false
      }},
      cloudinary:{ 
        cloud_name: 'kenhiru', 
        api_key: '812136389122935', 
        api_secret: '_ovqye1yEbry8sHmQnpcR6nXRbU' 
      }
  };
}
if(process.env.NODE_ENV === 'production')
{
  console.log("###using production envoirement###");
  module.exports = {
      server: {
              host: '0.0.0.0',
              port: process.env.PORT || 8000
      },
      database: {
          host: 'mongodb',
          port: '27017',
          db: 'expaus',
          username: 'prodDBMongo',
          password: 'ExpausTokyoVen',
          url: 'mongodb://prodDBMongo:ExpausTokyoVen@'+process.env.MONGODB_PORT_27017_TCP_ADDR+':'+process.env.MONGODB_PORT_27017_TCP_PORT+'/expaus?authMechanism=SCRAM-SHA-1&authSource=expaus'
      },
       instagramConfig: {
          clientID: '10efef3fbbe6497389b645b10bd9fb20',
          clientSecret: '806503e8f4c44c2ead245b49404d5e13',
          followers: 9900,
          testUserName: 'hayato_1013'
      },
      url: {
          backendUrl: 'http://lxgic-newapp.herokuapp.com',
          basePath: 'https://expaus.in',
      },
      adminDetails: {
          email: "info@expaus.in",
          user: "Admin",
          password: "connekt0701"
      },
      configMailer: {
          senderUser: 'support@expaus.in',
          senderPass: 'connekt-1010',
          from: 'account@gmail.com'
      },
      redisConfig: {
        port: '6379',
        host: 'redis',
        options: {
          no_ready_check: false
      }},
      paypalConfig: {
           userId:    'hirumakenta-facilitator_api1.outlook.jp',
           password:  'U7PHK9F55PBXTXUX',
           signature: 'AFcWxV21C7fd0v3bYYYRCpSSRl31AafRGXS-av9ViPtrX5IWOHaCs6Oy',
           sandbox:   true 
      },
      cloudinary:{ 
        cloud_name: 'kenhiru', 
        api_key: '812136389122935', 
        api_secret: '_ovqye1yEbry8sHmQnpcR6nXRbU' 
      }
  };
}

/*paypalConfig: {
           appId:     'APP-2YJ85237BW178013P',
           userId:    'accounts_api1.lxgic.org',
           password:  'SEMRMN2VPMXY84DL',
           signature: 'AkKlZyXaIabIgMT3743q5TqxJmogAuWXIDaAiMfw-Xf9YHUeSXtU3yFJ',
           sandbox:   true 
      },*/