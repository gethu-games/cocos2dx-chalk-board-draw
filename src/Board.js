var Config                      =   {};

var Board = cc.Scene.extend({

    boardSprite                 :   null,

    renderTex                   :   null,

    chalkSprite                 :   null,

    chalkBrush                  :   null,

    prevPoint                   :   cc.p(0, 0),

    boardSpace                  :   null,

    cellSize                    :   null,

    offset                      :   null,

    mode                        :   0,

    ctor                        :   function () {

        this._super();

        var slf                 =   this;
        var size                =   cc.winSize;
        
        // Initialize Touch handlets
        if( 'touches' in cc.sys.capabilities ) { 
            console.log('Can Touch');
            this._touchListener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchesBegan: this.onTouchesBegan,
                onTouchesMoved: this.onTouchesMoved,
                onTouchesEnded: this.onTouchesEnded
            });

            cc.eventManager.addListener(this._touchListener, this);
        } else {
            console.log('No Touch Capabs');
        }

        // Grid Configuration 
        Config.colCount         =   5;
        Config.rowCount         =   5;
        Config.drawSpeed        =   10;
        Config.lineColor        =   cc.color(250, 250, 50, 200);

        // Initializing Grid Drawing parameters
        this.boardSpace         =   cc.size(size.width * 0.75, size.width * 0.75);
        this.cellSize           =   cc.size(this.boardSpace.width / Config.colCount, this.boardSpace.height / Config.rowCount);
        this.offset             =   cc.p(size.width * 0.12, size.height * 0.12);

        // Adding Sprites - Begin
        this.boardSprite        =   cc.Sprite.create(res.Board_BG);
        this.boardSprite.setPosition(cc.p(size.width / 2, size.height / 2));
        this.boardSprite.setScale(640 / this.boardSprite.getContentSize().width,
                size.height / this.boardSprite.getContentSize().height);
        this.addChild(this.boardSprite);

        this.renderTex     =   cc.RenderTexture.create(size.width, size.height);
        this.renderTex.setPosition(cc.p(size.width / 2, size.height / 2));
        this.addChild(this.renderTex);

        this.chalkSprite        =   cc.Sprite.create(res.chalk_png);
        this.chalkSprite.setPosition(cc.p(size.width * 0.7, this.chalkSprite.getContentSize().height * 0.8));
        this.addChild(this.chalkSprite, 2);

        this.duster             =   cc.Sprite.create(res.duster_png);
        this.duster.setPosition(cc.p(this.duster.getContentSize().width * 0.5, this.duster.getContentSize().height * 0.8));
        this.duster.setScale(0.5);
        this.duster.setRotation(30);
        this.addChild(this.duster, 2);
        // Adding Sprites - End

        this.createMenu();

        this.drawBoard();
    }, 

    createMenu                  :   function() {

        var size                =   cc.winSize;

        var drawMenuItemImage   =   cc.MenuItemFont.create('Draw Grid');
        var drawMenuItem        =   cc.MenuItemToggle.create(drawMenuItemImage, this.drawMenuItemTapped, this);
        drawMenuItem.setPosition(cc.p(size.width * 0.5, size.height * 0.75));

        this.menu               =   cc.Menu.create(drawMenuItem);
        this.menu.setPosition(cc.p(0, 0));
        this.addChild(this.menu);

    },

    onTouchesBegan:function(touches, event) {
        var slf                 =   event.getCurrentTarget();
        var pos                 =   touches[0].getLocation();
        console.log('Began : ' + JSON.stringify(pos));
        
        slf.prevPoint           =   pos;
        slf.mode                =   0;

        dist                    =   Math.round(cc.pDistance(pos, slf.duster.getPosition()));
        if (dist < slf.duster.getContentSize().width) {
            slf.mode            =   1;
            slf.renderTex.begin();
            slf.menu.visit();
            slf.renderTex.end();
            slf.menu.removeFromParent(true);
        }

        return                      true;
    },

    onTouchesMoved:function(touches, event) {
        var slf                 =   event.getCurrentTarget();
        var pos                 =   touches[0].getLocation();
        console.log('Move : ' + JSON.stringify(pos));
        //console.log('PrevPoint : ' + JSON.stringify(slf.prevPoint));

        var dist                =   Math.round(cc.pDistance(pos, slf.prevPoint));
        //console.log(dist);

        for (var i = 0; i < dist; i += 5) {
            var cPos            =   cc.pLerp(slf.prevPoint, pos, i/dist);
            if (slf.mode == 0) {
                slf.drawBrushAtPoint(cPos, cc.color(240, 240, 240, 230), 1, true);
            } else if (slf.mode == 1) {
                slf.eraseAtPoint(cPos);
            }
        }

        slf.prevPoint           =   pos;
    },

    onTouchesEnded              :   function(touches, event) {
        var slf                 =   event.getCurrentTarget();
        var pos                 =   touches[0].getLocation();
        var size                =   cc.winSize;

        console.log('End : ' + JSON.stringify(pos));

        if (slf.mode == 0) {
            slf.chalkSprite.runAction(cc.moveTo(0.2, cc.p(size.width * 0.7, slf.chalkSprite.getContentSize().height * 0.8)).easing(cc.easeIn(1.0)));
        } else if (slf.mode == 1) {
            slf.duster.runAction(cc.moveTo(0.2, cc.p(slf.duster.getContentSize().width * 0.5, slf.duster.getContentSize().height * 0.8)).easing(cc.easeIn(1.0)));
            slf.createMenu();
        }

    },

    drawBrushAtPoint            :   function(pt, color, density, vertical) {

        this.renderTex.begin();
        for (var i = 0; i < density; i++) {
            this.chalkBrush     =   cc.Sprite.create(res.chalkBrush_png);
            this.chalkBrush.setRotation(Math.random() * 180);
            if (vertical) {
                this.chalkBrush.setPosition(cc.p(pt.x, pt.y + 5 * (i - density * 0.5)));
            } else {
                this.chalkBrush.setPosition(cc.p(pt.x + 5 * (i - density * 0.5), pt.y));
            }
            this.chalkBrush.setColor(color);
            this.chalkBrush.setScale(1.5);
            this.chalkBrush.visit();
        }
        this.renderTex.end();

        this.chalkSprite.setPosition(cc.p(pt.x - this.chalkSprite.getContentSize().width * 0.3,
            pt.y - this.chalkSprite.getContentSize().height * 0.2));

    },

    eraseAtPoint                :   function(pt) {

        this.renderTex.begin();
        this.chalkBrush         =   cc.Sprite.create(res.chalkBrush_png);
        this.chalkBrush.setRotation(Math.random() * 180);
        this.chalkBrush.setPosition(pt);
        this.chalkBrush.setScale(10.0);
        this.chalkBrush.setOpacity(230);
        this.chalkBrush.setBlendFunc(  cc.ZERO, cc.ONE_MINUS_SRC_ALPHA );
        this.chalkBrush.visit();
        this.renderTex.end();

        this.duster.setPosition(pt);

    },

    drawBoard                   :   function(dt) {

        this.vLineIndex         =   0;
        //this.hLineIndex         =   -1;
        //this.currentLinePercent =   1.025;

        //this.schedule(this.updateVGridDraw, 0);
        this.currentLinePercent =   1.0;
        this.schedule(this.updateVGridDraw);
    },

    updateDrawLine              :   function(dt) {

        this.currentLinePercent         -=  0.02;
        to                  =   cc.p(cc.winSize.width * 0.5, this.currentLinePercent * cc.winSize.height);
        this.drawBrushAtPoint(to, cc.color(250, 250, 50, 200), 16);

        if (this.currentLinePercent < 0.0) {
            this.unschedule(this.updateDrawLine);
        }

    },

    updateVGridDraw              :   function(dt) {

        this.currentLinePercent         -=  0.01 * Config.drawSpeed;
        to                  =   cc.p(this.vLineIndex * this.cellSize.width + this.offset.x, this.currentLinePercent * this.boardSpace.height + this.offset.y);
        this.drawBrushAtPoint(to, Config.lineColor, 16, true);

        if (this.currentLinePercent < 0.01) {
            this.vLineIndex++;
            if (this.vLineIndex <= Config.colCount) {
                this.currentLinePercent = 1.0;
            } else {
                this.vLineIndex         =   -1;
                this.hLineIndex         =   Config.rowCount;
                this.currentLinePercent =   -0.01;
                this.unschedule(this.updateVGridDraw);
                this.schedule(this.updateHGridDraw, 0);
            }
        }
    },

    updateHGridDraw              :   function(dt) {
        this.currentLinePercent         +=  0.01 * Config.drawSpeed;
        if (this.currentLinePercent > 0.93)
            this.currentLinePercent     =   0.931;
        to                  =   cc.p(this.currentLinePercent * this.boardSpace.width + this.offset.x, this.hLineIndex * this.cellSize.height + this.offset.y);
        this.drawBrushAtPoint(to, Config.lineColor, 16, false);

        if (this.currentLinePercent > 0.93) {
            this.hLineIndex--;
            if (this.hLineIndex != -1) {
                this.currentLinePercent =   -0.01;
            } else {
                this.unschedule(this.updateHGridDraw);
            }
        }
    },

    drawMenuItemTapped          :   function() {
        this.drawBoard();
    }


});

