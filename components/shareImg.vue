<template>
  <!-- Vue2唯一根节点 -->
  <view class="root-wrap">
    <!-- 仅上下拖拽的分享按钮 -->
    <view
      class="float-wrap"
      :style="{ top: top + 'px', right: '10px' }"
      @touchstart="handleTouchStart"
      @touchmove.stop="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <button class="share-btn" @click="captureAndShare">分享截图</button>
    </view>

    <!-- 隐藏的canvas：尺寸和屏幕一致 -->
    <canvas 
      canvas-id="captureCanvas" 
      class="hidden-canvas"
      :style="{width: screenWidth + 'px', height: screenHeight + 'px'}"
    ></canvas>
  </view>
</template>

<script>
export default {
  data() {
    return {
      top: 400,          // 分享按钮初始位置
      startY: 0,         // 拖拽起始Y
      isDragging: false, // 拖拽状态
      isCapturing: false,// 截图状态
      screenWidth: uni.getWindowInfo?.()?.windowWidth || 375,  // 屏幕宽度(px)
      screenHeight: uni.getWindowInfo?.()?.windowHeight || 667 // 屏幕高度(px)
    }
  },
  methods: {
    // ========== 1. 分享按钮上下拖拽逻辑 ==========
    handleTouchStart(e) {
      this.isDragging = true;
      this.startY = e.touches[0].clientY;
    },
    handleTouchMove(e) {
      if (!this.isDragging) return;
      const moveY = e.touches[0].clientY - this.startY;
      // 限制拖拽范围：顶部10px 到 屏幕底部-80px
      this.top = Math.max(10, Math.min(this.top + moveY, this.screenHeight - 80));
      this.startY = e.touches[0].clientY;
    },
    handleTouchEnd() {
      this.isDragging = false;
    },

    // ========== 2. 核心：手绘编辑页内容 + 截图 + 微信分享 ==========
    async captureAndShare() {
      if (this.isDragging || this.isCapturing) return;
      this.isCapturing = true;

      // #ifdef MP-WEIXIN
      try {
        uni.showLoading({ title: '生成截图中...', mask: true });

        // 获取父组件的编辑页数据（4场赛事+投注信息）
        const parentVm = this.$parent;
        if (!parentVm || !parentVm.selectedMatchList) {
          throw new Error('未获取到赛事数据');
        }
        const { selectedMatchList, betCount, betNotes, totalBetAmount } = parentVm;

        // 初始化canvas上下文
        const canvasId = 'captureCanvas';
        const ctx = wx.createCanvasContext(canvasId, this);
        // rpx转px工具函数（适配canvas绘制）
        const rpxToPx = (rpx) => (rpx / 750) * this.screenWidth;

        // ========== 步骤1：绘制页面整体背景 ==========
        ctx.setFillStyle('#f5f5f5');
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        // ========== 步骤2：绘制顶部导航栏（模拟CustomHeader） ==========
        const navBarHeight = rpxToPx(80) + (parentVm.statusBarHeight || 20);
        // 导航栏背景
        ctx.setFillStyle('#ffffff');
        ctx.fillRect(0, 0, this.screenWidth, navBarHeight);
        // 导航栏文字
        ctx.setFontSize(rpxToPx(32));
        ctx.setFillStyle('#333333');
        ctx.setTextAlign('center');
        ctx.fillText('足球 - 4场', this.screenWidth / 2, (parentVm.statusBarHeight || 20) + rpxToPx(40));

        // ========== 步骤3：绘制4场赛事列表（核心） ==========
        let y = navBarHeight + rpxToPx(20); // 赛事起始Y坐标
        const matchRowMargin = rpxToPx(10); // 赛事行间距
        const matchRowPadding = rpxToPx(16); // 赛事行内边距
        const matchRowWidth = this.screenWidth - rpxToPx(40); // 赛事行宽度

        // 绘制空数据提示（无赛事时）
        if (selectedMatchList.length === 0) {
          ctx.setFillStyle('#ffffff');
          ctx.fillRect(rpxToPx(20), y, matchRowWidth, rpxToPx(100));
          ctx.setFillStyle('#999999');
          ctx.setFontSize(rpxToPx(26));
          ctx.fillText('暂无已选赛事', this.screenWidth / 2, y + rpxToPx(50));
          y += rpxToPx(100) + matchRowMargin;
        } 
        // 绘制4场赛事（有数据时）
        else {
          selectedMatchList.forEach((item, index) => {
            if (index >= 4) return; // 只画4场
            if (y + rpxToPx(200) > this.screenHeight - rpxToPx(200)) return; // 避免超出投注栏

            // 3.1 绘制单场赛事背景（白色卡片）
            ctx.setFillStyle('#ffffff');
            ctx.fillRect(rpxToPx(20), y, matchRowWidth, rpxToPx(180));
            ctx.setStrokeStyle('#DEDEDE');
            ctx.strokeRect(rpxToPx(20), y, matchRowWidth, rpxToPx(180));

            // 3.2 绘制队名VS行
            const teamVsY = y + rpxToPx(30);
            // 主队名
            ctx.setFontSize(rpxToPx(24));
            ctx.setFillStyle('#333333');
            ctx.setTextAlign('right');
            const homeX = this.screenWidth / 2 - rpxToPx(30);
            ctx.fillText(item.home_name || '', homeX, teamVsY);
            // VS文字
            ctx.setTextAlign('center');
            ctx.fillText('VS', this.screenWidth / 2, teamVsY);
            // 客队名
            ctx.setTextAlign('left');
            const awayX = this.screenWidth / 2 + rpxToPx(30);
            ctx.fillText(item.visiting_name || '', awayX, teamVsY);

            // 3.3 绘制比分矩阵（核心：复刻选中状态）
            const matrixY = y + rpxToPx(60);
            const matrixWidth = matchRowWidth;
            const matrixLabelWidth = rpxToPx(80); // 主/客标签宽度
            const cellWidth = (matrixWidth - matrixLabelWidth) / 4; // 每个比分单元格宽度
            const cellHeight = rpxToPx(60); // 单元格高度
            const scores = [0, 1, 2, '3+']; // 比分选项

            // 绘制主队行
            // 主标签背景
            ctx.setFillStyle('#f5f5f5');
            ctx.fillRect(rpxToPx(20), matrixY, matrixLabelWidth, cellHeight);
            ctx.setStrokeStyle('#ddd');
            ctx.strokeRect(rpxToPx(20), matrixY, matrixLabelWidth, cellHeight);
            // 主标签文字
            ctx.setFillStyle('#333333');
            ctx.setFontSize(rpxToPx(26));
            ctx.setTextAlign('center');
            ctx.fillText('主', rpxToPx(20) + matrixLabelWidth/2, matrixY + cellHeight/2);
            // 主队比分单元格（带选中状态）
            scores.forEach((score, i) => {
              const cellX = rpxToPx(20) + matrixLabelWidth + i * cellWidth;
              // 选中状态：红色背景+白色文字
              if (item.homeScoreSelected?.includes(score)) {
                ctx.setFillStyle('#d92929');
                ctx.fillRect(cellX, matrixY, cellWidth, cellHeight);
                ctx.setFillStyle('#ffffff');
              } else {
                ctx.setFillStyle('#ffffff');
                ctx.fillRect(cellX, matrixY, cellWidth, cellHeight);
                ctx.setFillStyle('#333333');
              }
              // 比分文字
              ctx.fillText(score.toString(), cellX + cellWidth/2, matrixY + cellHeight/2);
              // 单元格边框
              ctx.setStrokeStyle('#ddd');
              ctx.strokeRect(cellX, matrixY, cellWidth, cellHeight);
            });

            // 绘制客队行
            // 客标签背景
            ctx.setFillStyle('#f5f5f5');
            ctx.fillRect(rpxToPx(20), matrixY + cellHeight, matrixLabelWidth, cellHeight);
            ctx.setStrokeStyle('#ddd');
            ctx.strokeRect(rpxToPx(20), matrixY + cellHeight, matrixLabelWidth, cellHeight);
            // 客标签文字
            ctx.setFillStyle('#333333');
            ctx.fillText('客', rpxToPx(20) + matrixLabelWidth/2, matrixY + cellHeight + cellHeight/2);
            // 客队比分单元格（带选中状态）
            scores.forEach((score, i) => {
              const cellX = rpxToPx(20) + matrixLabelWidth + i * cellWidth;
              if (item.awayScoreSelected?.includes(score)) {
                ctx.setFillStyle('#d92929');
                ctx.fillRect(cellX, matrixY + cellHeight, cellWidth, cellHeight);
                ctx.setFillStyle('#ffffff');
              } else {
                ctx.setFillStyle('#ffffff');
                ctx.fillRect(cellX, matrixY + cellHeight, cellWidth, cellHeight);
                ctx.setFillStyle('#333333');
              }
              ctx.fillText(score.toString(), cellX + cellWidth/2, matrixY + cellHeight + cellHeight/2);
              ctx.setStrokeStyle('#ddd');
              ctx.strokeRect(cellX, matrixY + cellHeight, cellWidth, cellHeight);
            });

            // 更新下一行Y坐标
            y += rpxToPx(180) + matchRowMargin;
          });
        }

        // ========== 步骤4：绘制底部投注栏（复刻编辑页样式） ==========
        const betBarTop = this.screenHeight - (parentVm.betBarTotalHeight || rpxToPx(200));
        const betBarHeight = parentVm.betBarTotalHeight || rpxToPx(200);
        const safeAreaBottom = parentVm.safeAreaBottom || 0;

        // 4.1 投注栏顶部（倍数选择区）
        ctx.setFillStyle('#ffffff');
        ctx.fillRect(0, betBarTop, this.screenWidth, rpxToPx(80));
        // 倍数选择组
        const multiGroupX = this.screenWidth / 2 - rpxToPx(150);
        const multiGroupY = betBarTop + rpxToPx(15);
        // 投字
        ctx.setFillStyle('#333333');
        ctx.setFontSize(rpxToPx(30));
        ctx.fillText('投', multiGroupX, multiGroupY + rpxToPx(20));
        // 减号按钮
        ctx.setFillStyle('#dddddd');
        ctx.fillRect(multiGroupX + rpxToPx(30), multiGroupY, rpxToPx(52), rpxToPx(52));
        ctx.setFillStyle('#333333');
        ctx.setFontSize(rpxToPx(32));
        ctx.fillText('-', multiGroupX + rpxToPx(30) + rpxToPx(26), multiGroupY + rpxToPx(30));
        // 倍数输入框
        ctx.setFillStyle(parentVm.selectedMatchCount < 4 ? '#f5f5f5' : '#ffffff');
        ctx.fillRect(multiGroupX + rpxToPx(82), multiGroupY, rpxToPx(180), rpxToPx(52));
        ctx.setStrokeStyle('#cccccc');
        ctx.strokeRect(multiGroupX + rpxToPx(82), multiGroupY, rpxToPx(180), rpxToPx(52));
        // 倍数文字
        ctx.setFillStyle(parentVm.selectedMatchCount < 4 ? '#999999' : '#333333');
        ctx.setFontSize(rpxToPx(30));
        ctx.setTextAlign('center');
        ctx.fillText(betCount.toString(), multiGroupX + rpxToPx(82) + rpxToPx(90), multiGroupY + rpxToPx(30));
        // 加号按钮
        ctx.setFillStyle('#dddddd');
        ctx.fillRect(multiGroupX + rpxToPx(262), multiGroupY, rpxToPx(52), rpxToPx(52));
        ctx.setFillStyle('#333333');
        ctx.fillText('+', multiGroupX + rpxToPx(262) + rpxToPx(26), multiGroupY + rpxToPx(30));
        // 倍字
        ctx.setFillStyle('#333333');
        ctx.fillText('倍', multiGroupX + rpxToPx(314), multiGroupY + rpxToPx(20));

        // 4.2 投注栏底部（信息展示区）
        ctx.setFillStyle('#232323');
        ctx.fillRect(0, betBarTop + rpxToPx(80), this.screenWidth, rpxToPx(100) + safeAreaBottom);
        // 投注信息文字
        ctx.setFillStyle('#ffffff');
        ctx.setFontSize(rpxToPx(28));
        ctx.setTextAlign('center');
        ctx.fillText(`共${betNotes || 0}注 ${betCount || 1}倍 ${totalBetAmount || 0}元`, this.screenWidth / 2, betBarTop + rpxToPx(80) + rpxToPx(40));
        // 4串1提示
        ctx.setFillStyle('#999999');
        ctx.setFontSize(rpxToPx(20));
        ctx.fillText('4串1 | 4场', this.screenWidth / 2, betBarTop + rpxToPx(80) + rpxToPx(70));

        // ========== 步骤5：完成canvas绘制 ==========
        await new Promise(resolve => ctx.draw(true, resolve));

        // ========== 步骤6：生成临时截图文件 ==========
        const tempRes = await new Promise((resolve, reject) => {
          wx.canvasToTempFilePath({
            canvasId: canvasId,
            x: 0,
            y: 0,
            width: this.screenWidth,
            height: this.screenHeight,
            destWidth: this.screenWidth * 2, // 2倍分辨率更清晰
            destHeight: this.screenHeight * 2,
            quality: 1.0, // 最高质量
            success: resolve,
            fail: reject
          }, this);
        });

        // ========== 步骤7：调用微信原生分享菜单 ==========
        wx.showShareImageMenu({
          path: tempRes.tempFilePath, // 手绘的截图路径
          success: () => {
            uni.hideLoading();
            this.isCapturing = false;
            uni.showToast({ title: '分享成功', icon: 'success', duration: 2000 });
          },
          fail: (err) => {
            uni.hideLoading();
            this.isCapturing = false;
            // 分享取消不提示，其他失败提示并兜底保存
            if (!err.errMsg.includes('cancel')) {
              uni.showToast({ title: '分享失败', icon: 'none' });
              // 兜底：保存到相册
              wx.saveImageToPhotosAlbum({
                filePath: tempRes.tempFilePath,
                success: () => uni.showToast({ title: '截图已保存到相册', icon: 'success' })
              });
            }
          }
        });

      } catch (err) {
        uni.hideLoading();
        this.isCapturing = false;
        console.error('截图/分享失败：', err);
        uni.showModal({
          title: '操作失败',
          content: '截图生成失败，请手动截图分享',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
      // #endif

      // #ifndef MP-WEIXIN
      this.isCapturing = false;
      uni.showToast({ title: '仅微信小程序支持', icon: 'none' });
      // #endif
    }
  }
}
</script>

<style scoped>
.root-wrap {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none; /* 不影响底层页面操作 */
}

/* 拖拽分享按钮样式 */
.float-wrap {
  position: fixed;
  z-index: 9999;
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* 按钮可点击 */
}

.share-btn {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #45b88e, #31926e);
  color: #fff;
  font-size: 20rpx;
  line-height: 70rpx;
  text-align: center;
  padding: 0;
}

/* 隐藏的canvas：放在视口外，不影响页面 */
.hidden-canvas {
  position: fixed;
  top: -9999px;
  left: -9999px;
  pointer-events: none;
  z-index: -1;
}
</style>