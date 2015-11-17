
var Board = cc.Scene.extend({

    boardSprite                 :   null,

    renderTex                   :   null,

    chalkSprite                 :   null,

    chalkBrush                  :   null,

    prevPoint                   :   cc.p(0, 0),

    ctor                        :   function () {

        this._super();

        var slf                 =   this;
        var size                =   cc.winSize;
        
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

        this.boardSprite        =   cc.Sprite.create(res.Board_BG);
        this.boardSprite.setPosition(cc.p(size.width / 2, size.height / 2));
        this.boardSprite.setScale(640 / this.boardSprite.getContentSize().width,
                size.height / this.boardSprite.getContentSize().height);
        this.addChild(this.boardSprite);

        this.renderTex     =   cc.RenderTexture.create(size.width, size.height);
        this.renderTex.setPosition(cc.p(size.width / 2, size.height / 2));
        this.addChild(this.renderTex);

        this.chalkSprite        =   cc.Sprite.create(res.chalk_png);
        this.chalkSprite.setPosition(cc.p(100, 200));
        this.addChild(this.chalkSprite, 2);

        this.duster             =   cc.Sprite.create(res.duster_png);
        this.duster.setPosition(cc.p(this.duster.getContentSize().width * 0.5, this.duster.getContentSize().height * 0.8));
        this.duster.setScale(0.5);
        this.duster.setRotation(30);
        this.addChild(this.duster, 2);
    }, 

    onTouchesBegan:function(touches, event) {
        var slf                 =   event.getCurrentTarget();
        var pos                 =   touches[0].getLocation();
        
        slf.prevPoint           =   pos;

        return                      true;
    },

    onTouchesMoved:function(touches, event) {
        var slf                 =   event.getCurrentTarget();
        var pos                 =   touches[0].getLocation();
        //console.log('Move : ' + JSON.stringify(pos));
        //console.log('PrevPoint : ' + JSON.stringify(slf.prevPoint));

        var dist                =   Math.round(cc.pDistance(pos, slf.prevPoint));
        //console.log(dist);

        for (var i = 0; i < dist; i += 5) {
            var cPos            =   cc.pLerp(slf.prevPoint, pos, i/dist);
            slf.drawBrushAtPoint(cPos, cc.color(240, 240, 240, 230));
        }

        slf.prevPoint           =   pos;
    },

    onTouchesEnded              :   function(touches, event) {
        var pos                 =   touches[0].getLocation();
        console.log('End : ' + JSON.stringify(pos));

    },

drawBrushAtPoint            :   function(pt, color) {

    this.renderTex.begin();
    this.chalkBrush         =   cc.Sprite.create(res.chalkBrush_png);
    this.chalkBrush.setRotation(Math.random() * 180);
    this.chalkBrush.setPosition(pt);
    this.chalkBrush.setColor(color);
    this.chalkBrush.setScale(1.5);
    this.chalkBrush.visit();
    this.renderTex.end();

    this.chalkSprite.setPosition(cc.p(pt.x - this.chalkSprite.getContentSize().width * 0.3,
        pt.y - this.chalkSprite.getContentSize().height * 0.2));

}

});

