// pages/save/save.js
let ctx = wx.createCanvasContext('preview_canvas');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    previewImagePath: '',
    backgroundPath: '',
    assemblies: []
  },

  // 绘制图形
  draw() {
    return new Promise((resolve, reject) => {

      // 按照 z-index 的大小对组件排序
      let sortedAssemblies = this.data.assemblies.sort((value1, value2) => {
        if (value1.z_index < value2.z_index) {
          return -1;
        } else if (value1.z_index > value2.z_index) {
          return 1;
        } else {
          return 0;
        }
      })


      // 设置文字对齐方式
      ctx.setTextAlign('center')
      ctx.setTextBaseline('top')
      // 绘制背景图
      ctx.drawImage(this.data.backgroundPath, 0, 0, 750, 1112)
      // 绘制组件
      for (let i in sortedAssemblies) {
        ctx.translate(sortedAssemblies[i].stickerCenterX, sortedAssemblies[i].stickerCenterY)
        ctx.rotate(sortedAssemblies[i].rotate * Math.PI / 180)
        switch (sortedAssemblies[i].component_type) {
          case 'sticker':
            {
              ctx.drawImage(sortedAssemblies[i].image_url, -100 * sortedAssemblies[i].scale, -100 * sortedAssemblies[i].scale, 200 * sortedAssemblies[i].scale, 200 * sortedAssemblies[i].scale)
              break
            }
          case 'image':
            {
              if (sortedAssemblies[i].wh_scale >= 1) {
                ctx.drawImage(sortedAssemblies[i].image_url, -100 * sortedAssemblies[i].scale, -100 * sortedAssemblies[i].scale / sortedAssemblies[i].wh_scale, 200 * sortedAssemblies[i].scale, 200 * sortedAssemblies[i].scale / sortedAssemblies[i].wh_scale)
              } else {
                ctx.drawImage(sortedAssemblies[i].image_url, -100 * sortedAssemblies[i].scale * sortedAssemblies[i].wh_scale, -100 * sortedAssemblies[i].scale, 200 * sortedAssemblies[i].scale * sortedAssemblies[i].wh_scale, 200 * sortedAssemblies[i].scale)
              }
              break
            }
          case 'text':
            {
              // 初始化字体大小
              ctx.setFontSize(28 * sortedAssemblies[i].scale)

              // 分割字符串
              var textArray = sortedAssemblies[i].text.split(''),
                temp = '',
                row = []

              // 按长度组合每行的文本
              for (let j in textArray) {
                if (ctx.measureText(temp).width > 180 * sortedAssemblies[i].scale) {
                  row.push(temp)
                  temp = ''
                }
                temp += textArray[j]
              }
              row.push(temp)

              // 绘制文本
              for (let k in row) {
                ctx.fillText(row[k], 0, (4 * (k + 1) - 100) * sortedAssemblies[i].scale)
              }

              break
            }
        }
        // 恢复上下文状态
        ctx.rotate(-sortedAssemblies[i].rotate * Math.PI / 180)
        ctx.translate(-sortedAssemblies[i].stickerCenterX, -sortedAssemblies[i].stickerCenterY)
      }

      // 开始渲染
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'preview_canvas',
          success: res => {
            // 保存预览图临时路径
            this.setData({
              previewImagePath: res.tempFilePath
            })
            wx.hideLoading();
          },
          fail: error => {
            util.showModal('保存失败', error, true)
          }
        })
      })
    })
  },

  onSaveToAlbum() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.previewImagePath,
      success: res => {
        wx.showToast({
          title: '保存成功',
          image: '../../assets/hud/success.png'
        })
      }
    })
  },

  onShare() {

  },

  // 下载图片
  downloadFile(url) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: url,
        success: (res) => {
          resolve(res.tempFilePath);
        }
      })
    })
  },


  // 下载所有贴纸图片
  downloadAllSticker(stickerUrls) {
    return Promise.all(stickerUrls.map((val) => {
      return this.downloadFile(val.url)
    }));
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '渲染中',
    })

    options = JSON.parse(options.data);

    let stickerUrls = [];

    for (let i = 0; i < options.assemblies.length; i++) {
      if (options.assemblies[i].component_type == 'sticker') {
        stickerUrls.push({
          'sindex': i,
          'url': options.assemblies[i].image_url
        })
      }
    }

    console.log(stickerUrls);

    this.downloadAllSticker(stickerUrls)
      .then((data) => {
        stickerUrls.map((val, index) => {
          stickerUrls[index].url = data[index]
        })



        options.assemblies.map((assembly, index) => {

          for (let i = 0; i < stickerUrls.length; i++) {
            if (stickerUrls[i].sindex == index) {
              assembly.image_url = stickerUrls[i].url
            }
          }
        })

        console.log(options.assemblies);

        new Promise((resolve, reject) => {
          resolve(options);
        })
      })
      .then((data) => {
        return this.downloadFile(options.backgroundPath)
      })
      .then((data) => {
        options.backgroundPath = data;

        this.setData({
          backgroundPath: options.backgroundPath,
          assemblies: options.assemblies
        })

        this.draw();
      })

  }
})