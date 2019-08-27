//index.js

const config = require('../../utils/config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 组件数组
    assemblies: [],

    // 当前页面最高层级
    max_z_index: 1,

    // 背景图片数组
    backgroundList: [],
    backgroundSelectedIndex: '',

    // 模板图片数组
    patternList: [],
    // 选择的模板类型索引
    patternTypeIndex: 0,
    // 选择的指定的贴纸
    stickerSelectedIndex: '',

    // 控制背景的动画效果
    backgroundAnim: '',
    backgroundBot: '-305rpx',
    backgroundDidOpen: false,

    // 控制贴纸的动画效果
    stickerAnim: '',
    stickerBot: '-305rpx',
    stickerDidOpen: false,

    // 是否正在编辑文本
    addingText: false,

    // 画布高度
    addContentHeight: '',
    windowBottom: '',

    // 控制组件选中状态
    selected: false,
    hidden: true,
    border: '',
  },

  // tabbar 背景按钮点击
  onBackgroundTabTap() {
    // 请求背景图片数组
    wx.request({
      url: config.backgroundList,
      success: (res) => {
        this.setData({
          backgroundList: res.data
        })
      },
      fail: (err) => {

      }
    })

    let flag = this.data.backgroundDidOpen;

    this.onRefreshView(() => {
      if (!flag) {
        this.showBackgroundTabbar();
      }
    });
  },

  // 选择了指定背景图
  onSelectBackground(e) {

    this.setData({
      backgroundSelectedIndex: e.currentTarget.dataset.bgindex
    })

  },

  // 显示背景选择view
  showBackgroundTabbar() {
    this.setData({
      backgroundAnim: 'tabbar-open',
      backgroundBot: 0,
      backgroundDidOpen: true
    })
  },

  // tabbar 贴纸按钮点击
  onStickerTabTap() {
    // 请求模板数组对象
    wx.request({
      url: config.patternList,
      success: (res) => {

        res.data.forEach((pattern, idx) => {
          if (idx == this.data.patternTypeIndex) {
            pattern.color = '#59c8b1';
          } else {
            pattern.color = '#808085';
          }
        })

        this.setData({
          patternList: res.data
        })
      },
      fail: (err) => {

      }
    })

    let flag = this.data.stickerDidOpen;

    this.onRefreshView(() => {
      if (!flag) {
        this.showStickerTabbar();
      }
    });

  },

  // 显示贴纸选择view
  showStickerTabbar() {
    this.setData({
      stickerAnim: 'tabbar-open',
      stickerBot: 0,
      stickerDidOpen: true
    })
  },

  // 选择了指定的贴纸
  onStickerSelect(e) {
    this.setData({
      stickerSelectedIndex: e.currentTarget.dataset.stickerindex
    })

    this.data.assemblies.push({
      id: Math.random().toString(36).substr(2, 4), // 随机生成4位id
      component_type: 'sticker',
      image_url: `${config.host}/sticker/${this.data.patternList[this.data.patternTypeIndex].imgs[this.data.stickerSelectedIndex]}`,
      stickerCenterX: 375,
      stickerCenterY: 300,
      scale: 1,
      rotate: 0,
      wh_scale: 1,
      z_index: this.data.max_z_index + 1 // 默认置于最顶层
    })

    // 刷新界面
    this.setData({
      assemblies: this.data.assemblies
    })
  },

  // 取消所有选择 关闭选择view
  onRefreshView(callback) {

    // 取消画布上组件的选中状态
    this.setData({
      selected: false,
      hidden: true,
      border: ''
    })

    // 关闭背景选择界面
    if (this.data.backgroundDidOpen) {
      this.setData({
        backgroundAnim: 'tabbar-close',
        backgroundBot: '-305rpx'
      })

      setTimeout(() => {
        this.setData({
          backgroundDidOpen: false
        })
      }, 300)

    }


    // 关闭贴纸选择界面
    if (this.data.stickerDidOpen) {
      this.setData({
        stickerAnim: 'tabbar-close',
        stickerBot: '-305rpx'
      })

      setTimeout(() => {
        this.setData({
          stickerDidOpen: false
        })
      }, 300)
    }

    // 如果有callback传入 则执行callback
    if (typeof callback === 'function') {
      callback();
    }
  },

  // 选择的模板类型名称
  onPatternTypeSelect(e) {
    let typeIndex = e.currentTarget.dataset.patterntype;
    this.setData({
      patternTypeIndex: typeIndex
    })

    this.data.patternList.forEach((pattern, idx) => {
      if (idx == typeIndex) {
        pattern.color = '#59c8b1';
      } else {
        pattern.color = '#808085';
      }
    })

    this.setData({
      patternList: this.data.patternList
    })
  },

  // tabbar 文字按钮点击
  onTextTabTap() {
    this.onRefreshView();

    // 显示弹框
    this.setData({
      addingText: true
    })
  },

  onInputCancel() {
    // 隐藏弹框
    this.setData({
      addingText: false
    })
  },

  onInputConfirm(e) {
    // 隐藏弹框
    this.setData({
      addingText: false
    })

    if (e.detail) {
      // 新文字入栈
      this.data.assemblies.push({
        id: Math.random().toString(36).substr(2, 4),
        component_type: 'text',
        text: e.detail,
        stickerCenterX: 375,
        stickerCenterY: 300,
        scale: 1,
        rotate: 0,
        z_index: this.data.max_z_index + 1 // 默认置于最顶层
      })

      // 刷新界面
      this.setData({
        assemblies: this.data.assemblies
      })
    }

  },

  // tabbar 图片按钮点击
  onImageTabTap() {

    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['ablum', 'camera'],
      success: (res) => {
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: (imageInfoRes) => {
            this.data.assemblies.push({
              id: Math.random().toString(36).substr(2, 4), // 随机生成4位id
              component_type: 'image',
              image_url: res.tempFilePaths[0],
              stickerCenterX: 375,
              stickerCenterY: 300,
              scale: 1,
              rotate: 0,
              wh_scale: imageInfoRes.width / imageInfoRes.height,
              z_index: this.data.max_z_index + 1 // 默认置于最顶层
            })

            this.setData({
              assemblies: this.data.assemblies
            })

            this.onUpdateMax_z_index()
          }
        })
      },
    })
  },


  // 更新当前页面最高层级
  onUpdateMax_z_index() {
    this.setData({
      max_z_index: this.data.max_z_index += 1
    })
  },


  // 移除组件
  onRemoveComponent(e) {
    // 移除组件列表中的相关项
    for (var i in this.data.assemblies) {
      if (this.data.assemblies[i].id === e.target.id) {
        this.data.assemblies.splice(i, 1);
        break
      }
    }

    // 刷新组件数据
    this.setData({
      assemblies: this.data.assemblies
    })
  },


  // 刷新组件数据
  onRefreshData(e) {
    for (var i in this.data.assemblies) {
      if (this.data.assemblies[i].id === e.target.id) {
        this.data.assemblies[i].stickerCenterX = e.detail.stickerCenterX
        this.data.assemblies[i].stickerCenterY = e.detail.stickerCenterY
        this.data.assemblies[i].scale = e.detail.scale
        this.data.assemblies[i].rotate = e.detail.rotate
        this.data.assemblies[i].z_index = e.detail.z_index
      }
    }
    this.setData({
      assemblies: this.data.assemblies
    })
  },

  // 预览
  onPreviewTap() {

    // 取消所有组件选择
    this.onRefreshView();

    // 页面数据传递
    let data = {
      backgroundPath: `${config.host}/${this.data.backgroundList[this.data.backgroundSelectedIndex]}`,
      assemblies: this.data.assemblies
    }

    console.log(this.data.backgroundSelectedIndex);

    if (this.data.assemblies.length && this.data.backgroundList.length) {
      wx.navigateTo({
        url: '../save/save?data=' + JSON.stringify(data)
      })
    } else {
      wx.showToast({
        title: '请添加元素',
        image: '../../assets/hud/warning.png'
      })
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sysInfo = wx.getSystemInfoSync();
    let ratio = 750 / sysInfo.windowWidth;

    this.setData({
      addContentHeight: (sysInfo.windowHeight * ratio - 105).toString(),
      windowBottom: (sysInfo.windowHeight * ratio * 0.5 - 120).toString()
    })
  }

})