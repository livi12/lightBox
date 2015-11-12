(function(){
	var LightBox=function(){
		var self=this;
		this.popupMask=$('<div id="G-lightbox-mask">');
		this.popupWin=$('<div id="G-lightbox-popup">');

		/*保存到body*/
		this.bodyNode=$(document.body);

		/*渲染剩余的Dom,并且插入到body*/
		this.renderDOM();

		/*获取图片的预览区域*/
		this.picViewArea=this.popupWin.find('div.lightbox-pic-view');
		this.popupPic=this.popupWin.find('img.lightbox-image');	/*图片*/
		this.picCaptionArea=this.popupWin.find('div.lightbox-pic-caption');/*图片描述区域*/
		this.nextBtn=this.popupWin.find('span.lightbox-next-btn');
		this.prevBtn=this.popupWin.find('span.lightbox-prev-btn');
		this.captionText=this.popupWin.find('p.lightbox-pic-desc');	/*图片描述*/
		this.currentIndex=this.popupWin.find('span.lightbox-of-index');/*图片索引*/
		this.closeBtn=this.popupWin.find('span.lightbox-close-btn');

		this.groupName=null;
		this.groupData=[];/*放置同一组数据*/
		this.bodyNode.on('click','.js-lightbox,*[data-role=lightbox]',  function(event) {
			/*阻止事件冒泡*/
			event.stopPropagation();
			var currentGroupName=$(this).attr('data-group');
			if(currentGroupName!=self.groupName){
				self.groupName=currentGroupName;
				/*根据当前组名获取同一组数据*/
				self.getGroup();
			}

			/*初始化弹窗,将当前点击的值传过去*/
			self.initPopup($(this));
		});

		/*关闭弹窗图片*/
		this.popupMask.click(function(event) {
			$(this).fadeOut();
			self.popupWin.fadeOut();
		});
		this.closeBtn.click(function(event) {
			self.popupMask.fadeOut();
			self.popupWin.fadeOut();
		});

		/*绑定上下切换按钮事件*/
		this.flag=true;
		this.prevBtn.hover(function() {
			if(!$(this).hasClass('disabled') &&  self.groupData.length>1){
				$(this).addClass('lightbox-prev-btn-show')
			}
		}, function() {
			if(!$(this).hasClass('disabled') &&  self.groupData.length>1){
				$(this).removeClass('lightbox-prev-btn-show')
			}
		}).click(function(event) {
			if(!$(this).hasClass('disabled') &&self.flag){
				self.flag=false;
				event.stopPropagation();
				self.goTo("prev");
			}
		});

		this.nextBtn.hover(function() {
			if(!$(this).hasClass('disabled') &&  self.groupData.length>1){
				$(this).addClass('lightbox-next-btn-show')
			}
		}, function() {
			if(!$(this).hasClass('disabled') &&  self.groupData.length>1){
				$(this).removeClass('lightbox-next-btn-show')
			}
		}).click(function(event) {
			if(!$(this).hasClass('disabled') &&self.flag ){
				self.flag=false;
				event.stopPropagation();
				self.goTo("next");
			}
		});
	}

	LightBox.prototype={
		goTo:function(dir){
			if(dir==="next"){
				this.index++;
				if(this.index>=this.groupData.length-1){
					this.nextBtn.addClass('disabled').removeClass('lightbox-next-btn-show');
				}
				if(this.index!=0){
					this.prevBtn.removeClass('disabled');
				}
				var src=this.groupData[this.index].src;
				this.loadPicSize(src);
			}else if(dir==="prev"){
				this.index--;
				if(this.index<=0){
					this.prevBtn.addClass('disabled').removeClass('lightbox-prev-btn-show');
				}
				if(this.index!=this.groupData.length-1){
					this.nextBtn.removeClass('disabled');
				}
				var src=this.groupData[this.index].src;
				this.loadPicSize(src);
			}
		},
		showMaskAndPopup:function(sourceSrc,currentId){
			var self=this;
			this.popupPic.hide();
			this.picCaptionArea.hide();
			this.popupMask.fadeIn();

			var winWidth=$(window).width(),
				winHeight=$(window).height();
			this.picViewArea.css({'width':winWidth/2,'height':winHeight/2});
			this.popupWin.fadeIn();

			var viewHeight=winHeight/2 +10;
			this.popupWin.css({'width':winWidth/2+10,'height':winHeight/2+10,'margin-left':-(winWidth/2+10)/2,'top':-viewHeight}).animate({'top':(winHeight-viewHeight)/2}, 300,function(){
				/*回调函数,加载图片，根据图片的尺寸，将弹出窗的尺寸做一次过渡*/
				self.loadPicSize(sourceSrc);
			});

			/*根据当前点击的元素id获取在当前组别里面的索引*/
			this.index=this.getIndexOf(currentId);

			var groupDataLength=this.groupData.length;
			if(groupDataLength>1){
				if(this.index==0){
					this.prevBtn.addClass('disabled');
					this.nextBtn.removeClass('disabled');
				}
				else if(this.index==groupDataLength-1){
					this.prevBtn.removeClass('disabled');
					this.nextBtn.addClass('disabled');
				}
				else{
					this.prevBtn.removeClass('disabled');
					this.nextBtn.removeClass('disabled');
				}
			}

		},
		/*获取图片的宽高*/
		loadPicSize:function(sourceSrc){
			var self=this;
			self.popupPic.css({'width':'auto','height':'auto'})
			this.preLoadImg(sourceSrc,function(){
				self.popupPic.attr('src',sourceSrc);
				var picWidth=self.popupPic.width();
				var picHeight=self.popupPic.height();
				self.changePic(picWidth,picHeight);
			});

		},
		/*改变图片的高宽的函数*/
		changePic:function(width,height){
			var self=this,
				winWidth=$(window).width(),
				winHeight=$(window).height();

			/*如果图片的宽高比例大于浏览器的宽高比例，看图片是否溢出*/
			var scale=Math.min(winWidth / (width+10),winHeight/(height+10),1);
			width=width*scale;
			height= height*scale;


			this.picViewArea.animate({'width':width-10,'height':height-10}, 300);
			this.popupWin.animate({'width':width,'height':height,'margin-left':-width/2,'top':(winHeight-height)/2}, 300,function(){
				self.popupPic.css({'width':width-10,'height':height-10}).fadeIn();
				self.picCaptionArea.fadeIn();
				self.flag=true;
			});

			/*设置描述文字及当前索引*/
			this.captionText.text(this.groupData[this.index].caption);
			this.currentIndex.text("当前索引："+(this.index+1)+" of "+this.groupData.length);
		},
		/*图片预加载*/
		preLoadImg:function(src,callback){
			var img =new Image();
			if(!!window.ActiveXObject){
				img.onreadystatechange=function(){
					if(this.readyState=="complete"){
						callback();
					}
				}
			}else{
				img.onload=function(){
					callback();
				}
			}
			img.src=src;
		},
		/*获取一组中图片的索引，防止其他元素产生影响*/
		getIndexOf:function(currentId){
			var index=0;
			$(this.groupData).each(function(i) {
				index=i;
				if(this.id===currentId){
					return false;
				}
			});
			return index;
		},
		initPopup:function(currentObj){
			var self=this;
			sourceSrc=currentObj.attr('data-source');
			currentId=currentObj.attr('data-id');
			this.showMaskAndPopup(sourceSrc,currentId);
		},
		getGroup:function(){
			var self=this;
			/*根据当前的组别名称获取页面中所有相同组别的对象*/
			var groupList=this.bodyNode.find('*[data-group='+this.groupName+']');

			/*清空数组数据*/
			self.groupData.length=0;
			groupList.each(function(index, el) {
				self.groupData.push({
					src:$(this).attr('data-source'),
					id:$(this).attr('data-id'),
					caption:$(this).attr('data-caption')
				});
			});

		},
		renderDOM:function(){
			var strDom='<div class="lightbox-pic-view">'+
				'<span class="lightbox-btn lightbox-prev-btn lightbox-prev-btn-show"></span>'+
				'<img src="http://img0.bdstatic.com/img/image/shouye/duorou1030.jpg" alt="" class="lightbox-image">'+
				'<span class="lightbox-btn lightbox-next-btn lightbox-next-btn-show"></span>'+
			'</div>'+
			'<div class="lightbox-pic-caption">'+
				'<div class="lightbox-caption-area">'+
					'<p class="lightbox-pic-desc"></p>'+
					'<span class="lightbox-of-index">当前索引</span>'+
				'</div>'+
				'<span class="lightbox-close-btn"></span>'+
			'</div>'
			this.popupWin.html(strDom);
			this.bodyNode.append(this.popupMask,this.popupWin);
		}
	}
	window['Lightbox']=LightBox;
})();