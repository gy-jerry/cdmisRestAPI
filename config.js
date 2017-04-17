

// configurations
module.exports = { 
  tokenSecret: 'zjubme319_ssgj', 
  cookieSecretExt: '111', 
  outerSecrets: ['111'], 
  defaultPwd: '123456', 
  defaultHash: '$2a$10$PWfht.vYnAgvUuSjB4jk2emJuLJQ6Up0I99pedaM.LbArEA7HkUKi', 
  bulkInsertBatch: 1000, 
  sessionExpiration: 1000 * 60 * 60 * 24 * 30, 
  SALT_WORK_FACTOR: 10, 
  TOKEN_EXPIRATION: 60 * 60, 
  resetPwdTOKEN_EXPIRATION: 60 * 1, 
  SMS_EXPIRATION: 2, 
  SMS_TOKEN: '111', 
  SMS_AppId: '111', 
  SMS_AccId: '111', 
  SMS_TPLId: '111', 
  SMS_Secret: '$2a$10$PWfht.vYnAgvUuSjB4jk2emJuLJQ6Up0I99pedaM.LbArEA7HkUKi',
  OPEN_LIST_API: {
    '8e22078dc5069fdbcddaebfcc53172fd': {
        apiname: 'a',
        API_TOKEN: '217775db95c311addcf0dbeb177f4ed5'
      },
    '2ec050b65240e1feafd4e83f00699051': {
        apiname: 'a',
        API_TOKEN: '1604e0a345a3fe20d252466754b9784a',
        PID: '199082001345',
        payInceType: '5-1'
      }, 
    '7d5be29de476efcfc52cd4fc99911e5e': {
      apiname: 'a',
      API_TOKEN: 'd896e6e9a9821a046d74b5ca3e6d765e'
    }
  },
  apiPlatformNames: {
    selfshopping:'健康',
    a: '药房'
  },
  apiRelationSuppliers: {
    a: {
      id: '5864876d5c4a4cf76ab3c359',
      name: '药房'
    }
  },
  delayWhenFailLogin: 300000, 
  bodyParserJSONLimit: 10240000, 
  default_pagination_limit: 20,
  projPath: '../', 
  relPath: 'yiyangbao', 
  dbUri: 'mongodb://localhost:3001/mongodb', 
  redisHOST: '127.0.0.1', 
  articlePerPage: 5, 
  activityPerPage: 5,
  commodityPerPage: 5,
  verificationCardPwdCount: 5,
  verificationCardPwdCountTop: 10,
  delayWhenFailVerifyCard: 24 * 60 * 60 * 1000,
  YLJ_CYCLE_DAY: 365,
  YLJ_YEAR_INTEREST: 25,
  selfShoppingObj: {
    payInceType: '5-1',
    apiname: 'selfshopping',
    PID: '999999991111',
    paymentType: 1
  },  
  postTypes: [ 
    { title: 'a', actions: [] },
    { title: 'a', actions: ['common', 'onCNPC'] },
    { title: 'a', actions: ['cart'] },
  ],
  pwdQuestions: [ 
    ['父亲名字',
    '母亲名字',
    '配偶名字',
    '小孩名字',
    '父亲生日',
    '母亲生日',
    '配偶生日',
    '小孩生日'],
    ['最喜欢的颜色',
    '小学名称',
    '最喜欢的演员'],
    ['最喜欢的歌曲',
    '初中名称',
    '最喜欢的宠物']
  ],
  Access_Control_Allow_Origin: ['http://localhost', 'http://10.12.43.168', 'http://127.0.0.1:8020', 'http://192.168.1.105:80', 'http://192.168.1.105',
   'http://localhost:8100', 'http://10.12.43.26:8100', 'http://10.12.43.28:8100', 'http://10.12.43.29:8100', 'http://10.12.43.61:8100', 'http://10.12.43.56:8100',
   'http://10.13.22.149:8100'],
  postAdvisor: 0,
  commentAdvisor: 0, 
  multerFieldSize: 100, 
  fileSizeLimit: 2048000, 
  multerFiles: 10, 
  multerFields: 10, 
  thumbWidth: 200, 
  ccapLenth: 4, 
  ccapFont: 30, 
  ccapNum: 1, 
  userLeveldown: 6, 
  userLevelinterval: 6,
  userLeveloffset: 2, 
  KindEditor: {
  	Up: 'KindEditor/upload'
  },
  UEditor: { 
    Up: 'UEditor/upload'
  },
  wxDeveloperConfig: {
    yyb: {
      appid: 'a',
      appsecret: 'a',
      merchantid: '1',
      merchantkey: 'a'
    },
    ybt: {
      appid: 'a',
      appsecret: 'a',
      merchantid: '1',
      merchantkey: 'a'
    }
  },
  credentialsType: {
    '1': '身份证',
    '2': '护照',
    '3': '军人证（军官证）',
    '4': '驾照',
    '5': '户口本',
    '6': '学生证',
    '6': '工作证',
    '7': '出生证',
    '8': '士兵证',
    '9': '回乡证',
    '10': '临时身份证',
    '11': '警官证',
    '12': '台胞证',
    '13': '港、澳、台通行证',
    '19': '其他',
  },
  insuredPersonType: {
    '1': '本人',
    '2': '父母',
    '3': '配偶',
    '4': '子女',
    '9': '其他'
  }
};