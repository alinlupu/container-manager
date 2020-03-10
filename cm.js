/*
 * Creates html element container based on type:
 * 0 - GENERAL, 
 * 1 - SVG,
 * 2 - CANVAS2D,
 * 3 - CANVAS3D
*/
var Container = function() {
	var self = this;
	var _w = 0;
	var _h = 0;
	var _x = 0;
	var _y = 0;
	var _type = 0;
	var _id = "";
	var _ctx = null;
	var _el = null;
	var _pel = null;
	var _flippable = 1;
	
	var createElement = () => {
		let _svgNS = "http://www.w3.org/2000/svg";
		let elexists = document.getElementById( _id );
		if( elexists ) {
			_el = elexists;	
		} else {
			switch( _type ) {
				case 0:
					_el = document.createElement( "div" );
					break;
				case 1:
					_el = document.createElementNS( _svgNS, "svg" );
					break;
				case 2:
					_el = document.createElement( "canvas" );
					_ctx = _el.getContext( "2d" );
					break;
				case 3:
					_el = document.createElement( "canvas" );
					_ctx = _el.getContext( "3d" );
					break;
				default:
					console.log( "[create-container-element] Container type not recognized" );
					return null;
			}
			_el.id = _id;
		}	
		_el.style.visibility = "hidden";
		_el.style.position = "absolute";
	}
	var updateElement = () => {
		let calcw = _w;
		let calch = _h;
		let calcy = _y;
		let calcx = _x;
		if( ( _w.a || _w.b ) && _w.x ) {
			calcw = _w.a * _w.x + _w.b;	
		}
		if( ( _h.a || _h.b ) && _h.x ) {
			calch = _h.a * _h.x + _h.b;	
		}
		if( ( _y.a || _y.b ) && _y.x ) {
			calcy = _y.a * _y.x + _y.b;	
		}
		if( ( _x.a || _x.b ) && _x.x ) {
			calcx = _x.a * _x.x + _x.b;	
		}

		let	wstr = `${ calcw }px`;
		let hstr = `${ calch }px`;
		let xstr = `${ calcx }px`;
		let ystr = `${ calcy }px`;
		if( _type == 0 || _type == 1 ) {
			_el.style.width = wstr;
			_el.style.height = hstr;
		} else {
			_el.width = _w;
			_el.height = _h;
		}
		_el.style.left = xstr;
		_el.style.top = ystr;
	}

	self.init = ({
		id = "",
		type = 0,
		width = 300,
		height = 300,
		x = 10,
		y = 10,
		flippable = 1,
		parentEl = document.body
	}) => {
		_w = width;
		_h = height;
		_x = x;
		_y = y;
		_type = type;
		_pel = parentEl;
		_id = id;
		_flippable = flippable;
		createElement();
		updateElement();		
		_pel.appendChild( _el );
	}
	
	self.update = ({
		width = _w,
		height = _h,
		x = _x,
		y = _y
	}={}) => {
		if( width.x && !width.a && !width.b ) {
			_w.x = width.x;
		} else {
			_w = width;
		}

		if( height.x && !height.a && !height.b ) {
			_h.x = height.x;
		} else {
			_h = height;
		}
		
		if( x.x && !x.a && !x.b ) {
			_x.x = x.x;
		} else {
			_x = x;
		}
		
		if( y.x && !y.a && !y.b ) {
			_y.x = y.x;
		} else {
			_y = y;
		}

		updateElement();
	}

	self.flip = () => {
		if( _flippable ) {	
			let vb = _el.getAttribute( "viewBox")
			if( vb ) {
				vb = vb.split( ' ' );	
				_el.setAttribute( "viewBox", `${vb[0]} ${vb[1]} ${vb[3]} ${vb[2]}` );
				console.log( _el.getAttribute( "viewBox" ) );
			}
			self.update({
				width: _h,
				height: _w,
				x: _y,
				y: _x
			});
		}
	}

	self.render = ({
		drawFunc = null		
	}={}) => {
		_el.style.visibility = "visible";
		if( _type > 1 ) drawFunc( _ctx );
	}
}

var ContainerManager = function() {
	var self = this;
	var _width = 0;
	var _height = 0;
	var _containers = [];
	
	self.flipped = false;
	self.create = ( width, height ) => {
		_width = width;
		_height = height;	
	}
	self.addContainer = ( params ) => {
		let container = new Container();
		if( !params.width ) params.width = _width;
		if( !params.height ) params.height = _height; 
		container.init( params );
		container.render({ drawFunc: params.drawFunc });
		_containers.push( container );
	}
	self.flip = () => {
		self.flipped = !self.flipped;
		_containers.forEach( (c) => {
			c.flip();
		});
	}
	self.resize = ({ 
		width = 0, 
		height = 0 }) => {
		
		_containers.forEach( (c) => {
			c.update({
				x: { x: width },
				y: { x: height },
				width: { x: width },
				height: { x: height }
			})
		})
	}
}

var LayoutManager = function() {
	var self = this;
	self.resizeFunc = null;
	self.initSize = () => {
		self.width = window.innerWidth;
		self.height = window.innerHeight;
	}
	self.resize = () => {
		self.initSize();
		if( self.resizeFunc ) self.resizeFunc();
		document.body.onresize = self.resize;
	}
	self.initSize();
}

var lm = new LayoutManager();
var cm = new ContainerManager();

cm.create( lm.width, lm.height );

/*
 * EXAMPLES
let draw = ( ctx ) => {
	ctx.fillStyle = "#000500";
	ctx.fillRect( 0, 0, parseInt( ctx.canvas.width ), parseInt( ctx.canvas.height ));
}
*/
/*
cm.addContainer({ 
	id: "main-container-CANVAS",
	type: 2,
	width: lm.width - 20,
	height: lm.height - 20,
	drawFunc: draw
});
*/

lm.resizeFunc = () => {
	cm.resize({ width: lm.width, height: lm.height });
}
document.body.onresize = lm.resize;
