export function getTextArr(context, text, maxWidth, reg_width) {
    var {
      reg1,
      reg2,
      reg3,
      reg4,
      reg5,
      reg6,
      width1,
      width2,
      width3,
      width4,
      width5,
      width6,
    } = reg_width;
    var match = false;
    // 字符分隔为数组
    var arrText = text.split("");
    var line = "";
    var newTextArr = [];
    var testWidth = 0;
    for (var n = 0; n < arrText.length; n++) {
      if (!match) {
        // 频繁调用measureText 导致绘制时间特别长
        // var metrics = context.measureText(testLine);
        // var testWidth = metrics.width;
  
        if (reg1.test(arrText[n])) {
          testWidth += width1;
        } else if (reg2.test(arrText[n])) {
          testWidth += width2;
        } else if (reg3.test(arrText[n])) {
          testWidth += width3;
        } else if (reg5.test(arrText[n])) {
          testWidth += width5;
        } else if (reg6.test(arrText[n])) {
          testWidth += width6;
        } else {
          testWidth += width4;
        }
  
        if (testWidth > maxWidth && n > 0) {
          newTextArr.push(line);
          line = arrText[n];
          match = true;
        } else {
          line = line + arrText[n];
        }
      }
    }
    newTextArr.push(line);
    return newTextArr;
  }
  
  function circleImg(ctx, img, x, y, r) {
    ctx.save();
    ctx.beginPath();
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, d, d);
    ctx.closePath();
    ctx.restore();
  }