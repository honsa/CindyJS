
//*******************************************************
// and here are the definitions of the drawing operators
//*******************************************************



evaluator.helper.extractPoint=function(v1){
    var erg={};
    erg.ok=false;
    if(v1.ctype!='list'){
        return erg;
    }
    
    var pt1=v1.value;
    var x=0;
    var y=0;
    var z=0;
    if(pt1.length==2){
        var n1=pt1[0];
        var n2=pt1[1];
        if(n1.ctype=='number' && n2.ctype=='number'){
            erg.x=n1.value.real;
            erg.y=n2.value.real;
            erg.ok=true;
            return erg;
        }
    }
    
    if(pt1.length==3){
        var n1=pt1[0];
        var n2=pt1[1];
        var n3=pt1[2];
        if(n1.ctype=='number' && n2.ctype=='number'&& n3.ctype=='number'){
            n1=Number.div(n1,n3);
            n2=Number.div(n2,n3);
            erg.x=n1.value.real;
            erg.y=n2.value.real;
            erg.ok=true;
            return erg;
        }
    }

    return erg;

}

evaluator.draw=function(args,modifs){
    var erg;
    var psize=csport.drawingstate.pointsize;
    var lsize=csport.drawingstate.linesize;
    var col;
    var black="rgb(0,0,0)";
    if(csport.drawingstate.alpha!=1){
        black="rgba(0,0,0,"+csport.drawingstate.alpha+")";
    }
    var handleModifs = function(type){
        if(modifs.size!==undefined){
            erg =evaluate(modifs.size);
            if(erg.ctype=='number'){
                if(type=="P"){
                    psize=erg.value.real;
                    
                    
                }
                if(type=="L"){
                    lsize=erg.value.real;
                    
                }
                
            }
        }
        
        
        if(modifs.color===undefined &&modifs.alpha===undefined){
            return;
        }
        
        
        var r=0;
        var g=0;
        var b=0;
        var alpha=csport.drawingstate.alpha;
        if(type=="P"){
            r=csport.drawingstate.pointcolorraw[0]*255;
            g=csport.drawingstate.pointcolorraw[1]*255;
            b=csport.drawingstate.pointcolorraw[2]*255;
        }
        if(type=="L"){
            r=csport.drawingstate.linecolorraw[0]*255;
            g=csport.drawingstate.linecolorraw[1]*255;
            b=csport.drawingstate.linecolorraw[2]*255;
        }
        
        if(modifs.color!==undefined){
            erg =evaluate(modifs.color);
            if(List.isNumberVector(erg).value){
                if(erg.value.length==3){
                    r=Math.floor(erg.value[0].value.real*255);
                    g=Math.floor(erg.value[1].value.real*255);
                    b=Math.floor(erg.value[2].value.real*255);
                    
                }
                
            }
        }

        
        if(modifs.alpha!==undefined){
            erg =evaluate(modifs.alpha);
            if(erg.ctype=="number"){
                alpha=erg.value.real;
            }
        }
        col="rgba("+r+","+g+","+b+","+alpha+")";//TODO Performanter machen
        black="rgba(0,0,0,"+alpha+")";//TODO Performanter machen
    }
    
    var drawsegcore=function(pt1,pt2){
        var m=csport.drawingstate.matrix;
        var xx1=pt1.x*m.a-pt1.y*m.b+m.tx;
        var yy1=pt1.x*m.c-pt1.y*m.d-m.ty;
        var xx2=pt2.x*m.a-pt2.y*m.b+m.tx;
        var yy2=pt2.x*m.c-pt2.y*m.d-m.ty;
        col=csport.drawingstate.linecolor
        
        handleModifs("L");
        
        csctx.beginPath();
        csctx.moveTo(xx1, yy1);
        csctx.lineTo(xx2, yy2);
        csctx.lineWidth = lsize;
        csctx.lineCap = 'round';
        
        //        csctx.strokeStyle="#0000FF";
        //        csctx.strokeStyle="rgba(0,0,255,0.2)";
        csctx.strokeStyle=col;
        csctx.stroke();
    }
    
    var drawsegment = function(){

        var v1=evaluateAndVal(args[0]);
        var v2=evaluateAndVal(args[1]);
        var pt1=evaluator.helper.extractPoint(v1);
        var pt2=evaluator.helper.extractPoint(v2);
        if(!pt1.ok||!pt2.ok){
            return nada;
        }
      
        drawsegcore(pt1,pt2);
        
        return nada;
    }
    
    var drawline = function(){
        var na=Number.abs(v1.value[0]).value.real;
        var nb=Number.abs(v1.value[1]).value.real;
        var nc=Number.abs(v1.value[2]).value.real;
        var divi;


        if(na>=nb&&na>=nc){
            divi=v1.value[0];
        }
        if(nb>=na&&nb>=nc){
            divi=v1.value[1];
        }
        if(nc>=nb&&nc>=na){
            divi=v1.value[2];
        }
        var a=Number.div(v1.value[0],divi);
        var b=Number.div(v1.value[1],divi);
        var c=Number.div(v1.value[2],divi);//TODO Realitycheck einbauen
        

        var l=[a.value.real,
              b.value.real,
              c.value.real]
        var b1,b2;
        if(Math.abs(l[0])<Math.abs(l[1])){
            b1=[1,0,30];
            b2=[-1,0,30];
        } else {
            b1=[0,1,30];
            b2=[0,-1,30];
        }
        var erg1=[
                  l[1]*b1[2]-l[2]*b1[1],
                  l[2]*b1[0]-l[0]*b1[2],
                  l[0]*b1[1]-l[1]*b1[0]
                  ];
        var erg2=[
                  l[1]*b2[2]-l[2]*b2[1],
                  l[2]*b2[0]-l[0]*b2[2],
                  l[0]*b2[1]-l[1]*b2[0]
                  ];

        
        var pt1={
        x:erg1[0]/erg1[2],
        y:erg1[1]/erg1[2]
        }
        var pt2={
        x:erg2[0]/erg2[2],
        y:erg2[1]/erg2[2]

        }


        drawsegcore(pt1,pt2);
        
    }

    
    var drawpoint = function(){
        var pt=evaluator.helper.extractPoint(v1);
        
        
        if(!pt.ok){
            return nada;
        }
        var m=csport.drawingstate.matrix;

        var xx=pt.x*m.a-pt.y*m.b+m.tx;
        var yy=pt.x*m.c-pt.y*m.d-m.ty;

        col=csport.drawingstate.pointcolor
        handleModifs("P");
        csctx.lineWidth = psize*.3;
        
        
        csctx.beginPath();
        csctx.arc(xx,yy,psize,0,2*Math.PI);
        csctx.fillStyle=col;
        
        csctx.fill();
        
        csctx.beginPath();
        csctx.arc(xx,yy,psize*1.15,0,2*Math.PI);
        csctx.fillStyle=black;
        csctx.strokeStyle=black;
        csctx.stroke();
    }
    
    
    if(args.length==2) {
        return drawsegment();
    }
    var v1=evaluateAndVal(args[0]);

    if(v1.usage=="Line"){
        return drawline();

    }
    return drawpoint();


    

    
    
}

evaluator.drawcircle=function(args,modifs){
  evaluator.helper.drawcircle(args,modifs,"D");
}


evaluator.fillcircle=function(args,modifs){
  evaluator.helper.drawcircle(args,modifs,"F");
}

evaluator.helper.drawcircle=function(args,modifs,df){
    var erg;
    var size=4;
    var col;
    var black="rgb(0,0,0)";
    var handleModifs = function(){
        if(modifs.size!==undefined){
            erg =evaluate(modifs.size);
            if(erg.ctype=='number'){
                size=erg.value.real;
            }
        }
        
        
        if(modifs.color===undefined &&modifs.alpha===undefined){
            return;
        }
        
        
        var r=0;
        var g=0;
        var b=0;
        var alpha=csport.drawingstate.alpha;
        
        r=csport.drawingstate.linecolorraw[0]*255;
        g=csport.drawingstate.linecolorraw[1]*255;
        b=csport.drawingstate.linecolorraw[2]*255;
        
        if(modifs.color!==undefined){
            erg =evaluate(modifs.color);
            if(List.isNumberVector(erg).value){
                if(erg.value.length==3){
                    r=Math.floor(erg.value[0].value.real*255);
                    g=Math.floor(erg.value[1].value.real*255);
                    b=Math.floor(erg.value[2].value.real*255);
                    
                }
                
            }
        }

        
        if(modifs.alpha!==undefined){
            erg =evaluate(modifs.alpha);
            if(erg.ctype=="number"){
                alpha=erg.value.real;
            }
        }
        
        col="rgba("+r+","+g+","+b+","+alpha+")";//TODO Performanter machen
    }
    
    
    var drawcirc = function(){
    
        var pt=evaluator.helper.extractPoint(v0);
        
        
        if(!pt.ok || v1.ctype!='number'){
            return nada;
        }
        var m=csport.drawingstate.matrix;

        var xx=pt.x*m.a-pt.y*m.b+m.tx;
        var yy=pt.x*m.c-pt.y*m.d-m.ty;
       
        col=csport.drawingstate.linecolor;
        handleModifs();
        csctx.lineWidth = size*.3;
        
        
        
        csctx.beginPath();
        csctx.lineWidth = size*.4;

        csctx.arc(xx,yy,v1.value.real*m.sdet,0,2*Math.PI);
        if(df=="D"){
            csctx.strokeStyle=col;
            csctx.stroke();
        }
        if(df=="F"){
            csctx.fillStyle=col;
            csctx.fill();
        }
    }
    
    
    if(args.length==2) {
        var v0=evaluateAndVal(args[0]);
        var v1=evaluateAndVal(args[1]);
    
        return drawcirc();
    }

    return nada;
}


evaluator.drawpoly=function(args,modifs){
  evaluator.helper.drawpolygon(args,modifs,"D");
}


evaluator.fillpoly=function(args,modifs){
  evaluator.helper.drawpolygon(args,modifs,"F");
}

evaluator.drawpolygon=function(args,modifs){
  evaluator.helper.drawpolygon(args,modifs,"D");
}


evaluator.fillpolygon=function(args,modifs){
  evaluator.helper.drawpolygon(args,modifs,"F");
}


evaluator.helper.drawpolygon=function(args,modifs,df){
    var erg;
    var size=4;
    var col;
    var black="rgb(0,0,0)";
    var handleModifs = function(){
        if(modifs.size!==undefined){
            erg =evaluate(modifs.size);
            if(erg.ctype=='number'){
                size=erg.value.real;
            }
        }
        
        
        if(modifs.color===undefined &&modifs.alpha===undefined){
            return;
        }
        
        
        var r=0;
        var g=0;
        var b=0;
        var alpha=csport.drawingstate.alpha;
        
        r=csport.drawingstate.linecolorraw[0]*255;
        g=csport.drawingstate.linecolorraw[1]*255;
        b=csport.drawingstate.linecolorraw[2]*255;
        
        if(modifs.color!==undefined){
            erg =evaluate(modifs.color);
            if(List.isNumberVector(erg).value){
                if(erg.value.length==3){
                    r=Math.floor(erg.value[0].value.real*255);
                    g=Math.floor(erg.value[1].value.real*255);
                    b=Math.floor(erg.value[2].value.real*255);
                    
                }
                
            }
        }

        
        if(modifs.alpha!==undefined){
            erg =evaluate(modifs.alpha);
            if(erg.ctype=="number"){
                alpha=erg.value.real;
            }
        }
        
        col="rgba("+r+","+g+","+b+","+alpha+")";//TODO Performanter machen
    }
    
    
    var drawpoly = function(){
        var m=csport.drawingstate.matrix;

        var li=[];
        for(var i=0;i<v0.value.length;i++){
            var pt=evaluator.helper.extractPoint(v0.value[i]);
            if(!pt.ok ){
                return nada;
            }
            var xx=pt.x*m.a-pt.y*m.b+m.tx;
            var yy=pt.x*m.c-pt.y*m.d-m.ty;

            li[li.length]=[xx,yy];
        } 
        col=csport.drawingstate.linecolor;
        handleModifs();
        csctx.lineWidth = size*.3;
        csctx.mozFillRule = 'evenodd';

        csctx.beginPath();
        csctx.lineWidth = size*.4;
        csctx.moveTo(li[0][0],li[0][1]);
        for(var i=1;i<li.length;i++){
            csctx.lineTo(li[i][0],li[i][1]);
        }
        csctx.closePath();
        if(df=="D"){
            csctx.strokeStyle=col;
            csctx.stroke();
        }
        if(df=="F"){
            csctx.fillStyle=col;
            csctx.fill();
        }
    }
    
    
    if(args.length==1) {
        var v0=evaluate(args[0]);
        if (v0.ctype=='list'){
            return drawpoly();
        
        }
    
    }

    return nada;
}



evaluator.drawtext=function(args,modifs){
    var size=csport.drawingstate.textsize;
    var bold="";
    var italics="";
    var family="Arial";
    var align=0;
    var ox=0;
    var oy=0;
    var handleModifs = function(){
        if(modifs.size!==undefined){
            erg =evaluate(modifs.size);
            if(erg.ctype=='number'){
                size=erg.value.real;
            }
        }

        if(modifs.bold!==undefined){
            erg =evaluate(modifs.bold);
            if(erg.ctype=='boolean' && erg.value ){
                bold="bold ";
            }
        }
        if(modifs.italics!==undefined){
            erg =evaluate(modifs.italics);
            if(erg.ctype=='boolean' && erg.value ){
                italics="italic ";
            }
        }
        
        if(modifs.family!==undefined){
            erg =evaluate(modifs.family);
            if(erg.ctype=='string'  ){
                family=erg.value;
            }
        }
        
        if(modifs.align!==undefined){
            erg =evaluate(modifs.align);
            if(erg.ctype=='string'  ){
                if(erg.value=="left"){align=0}; 
                if(erg.value=="right"){align=1}; 
                if(erg.value=="mid"){align=0.5}; 
            }
        }
        
        if(modifs.x_offset!==undefined){
            erg =evaluate(modifs.x_offset);
            if(erg.ctype=='number'){
                ox=erg.value.real;
            }
        }

        if(modifs.y_offset!==undefined){
            erg =evaluate(modifs.y_offset);
            if(erg.ctype=='number'){
                oy=erg.value.real;
            }
        }

        if(modifs.offset!==undefined){
            erg =evaluate(modifs.offset);
            if(erg.ctype=='list'){
                if(erg.value.length==2 &&
                erg.value[0].ctype=="number" &&
                erg.value[1].ctype=="number"){
                    ox=erg.value[0].value.real;
                    oy=erg.value[1].value.real;
                
                }
            
            }
        }

        
        
        if(modifs.color===undefined &&modifs.alpha===undefined){
            return;
        }
        
        
        var r=0;
        var g=0;
        var b=0;
        var alpha=csport.drawingstate.alpha;
        
        r=csport.drawingstate.textcolorraw[0]*255;
        g=csport.drawingstate.textcolorraw[1]*255;
        b=csport.drawingstate.textcolorraw[2]*255;
        
        if(modifs.color!==undefined){
            erg =evaluate(modifs.color);
            if(List.isNumberVector(erg).value){
                if(erg.value.length==3){
                    r=Math.floor(erg.value[0].value.real*255);
                    g=Math.floor(erg.value[1].value.real*255);
                    b=Math.floor(erg.value[2].value.real*255);
                    
                }
                
            }
        }

        
        if(modifs.alpha!==undefined){
            erg =evaluate(modifs.alpha);
            if(erg.ctype=="number"){
                alpha=erg.value.real;
            }
        }
        
        col="rgba("+r+","+g+","+b+","+alpha+")";//TODO Performanter machen
    }



    if(args.length==2) {
        var v0=evaluateAndVal(args[0]);
        var v1=evaluate(args[1]);
        var pt=evaluator.helper.extractPoint(v0);
        
        if(!pt.ok){
            return nada;
        }

        var m=csport.drawingstate.matrix;

        var xx=pt.x*m.a-pt.y*m.b+m.tx;
        var yy=pt.x*m.c-pt.y*m.d-m.ty;
       
        col=csport.drawingstate.textcolor;
        handleModifs();
        csctx.fillStyle=col;

        csctx.font=bold+italics+Math.round(size*10)/10+"px "+family;
        var txt=niceprint(v1);
        var width = csctx.measureText(txt).width;
        csctx.fillText(txt,xx-width*align+ox,yy-oy);        
           
    }

    return nada;

}

///////////////////////////////////////////////
////// FUNCTION PLOTTING    ///////////////////
///////////////////////////////////////////////


evaluator.plot=function(args,modifs){ //OK
    

    var v1=args[0];
    var li=evaluator.helper.plotvars(v1);
    var runv="#";
    if(li.indexOf("t")!=-1) {runv="t"};
    if(li.indexOf("z")!=-1) {runv="z"};
    if(li.indexOf("y")!=-1) {runv="y"};
    if(li.indexOf("x")!=-1) {runv="x"};


    namespace.newvar(runv);
    var start=-10;
    var stop=10;
    var step=2;
    var m=csport.drawingstate.matrix;
    var col=csport.drawingstate.linecolor
    csctx.strokeStyle=col;
    csctx.lineWidth = 1;
    csctx.lineCap = 'round';
    csctx.lineJoin = 'round';
    var connectb=false;
    var minstep=0.001;
    var pxlstep=.01;//TODO Anpassen auf PortScaling
        var count=0;
    var stroking=false;
    var canbedrawn=function(v){
       return v.ctype=='number' && Number.helper.isAlmostReal(v);
    }
    
    var drawstroke=function(x1,x2,v1,v2,step){
    
    }

    var limit=function(v){
       return v;
    
    }
    
    var drawstroke=function(x1,x2,v1,v2,step){
    count++;
//    console.log(niceprint(x1)+"  "+niceprint(x2));
        var xa=+x1.value.real;
        var ya=+v1.value.real;
        var xb=+x2.value.real;
        var yb=+v2.value.real;
        
        
        var xx1=xa*m.a-ya*m.b+m.tx;
        var yy1=xa*m.c-ya*m.d-m.ty;
        
        var xx2=xb*m.a-yb*m.b+m.tx;
        var yy2=xb*m.c-yb*m.d-m.ty;
        
        
        if(!stroking){
            csctx.beginPath();
            csctx.moveTo(xx1, yy1);
            csctx.lineTo(xx2, yy2);
            stroking=true;
        } else {
            csctx.lineTo(xx2, yy2);
        }
        
        
        
    }


    var drawrec=function(x1,x2,y1,y2,step){
    
        var drawable1 = canbedrawn(y1);
        var drawable2 = canbedrawn(y2);


        if ((step < minstep)) {//Feiner wollen wir  nicht das muss wohl ein Sprung sein
            if (connectb)
                drawstroke(runold, ergo, run, erg, step);
            return;
        }
        if (!drawable1 && !drawable2)
            return; //also hier gibt's nix zu malen, ist ja nix da

        var mid=Number.real((x1.value.real+x2.value.real)/2);
        namespace.setvar(runv,mid);
        var ergmid=evaluate(v1);
        
        var drawablem = canbedrawn(ergmid);
        
        if (drawable1 && drawable2 && drawablem) { //alles ist malbar ---> Nach Steigung schauen
            var a = limit(y1.value.real);
            var b = limit(ergmid.value.real);
            var c = limit(y2.value.real);
            var dd = Math.abs(a + c - 2 * b) / (pxlstep);
            var drawit=(dd<1) 
            if(drawit){//Weiterer Qualitätscheck eventuell wieder rausnehmen.
                    var mid1=Number.real((x1.value.real+mid.value.real)/2);
                    namespace.setvar(runv,mid1);
                    var ergmid1=evaluate(v1);
                    
                    var mid2=Number.real((mid.value.real+x2.value.real)/2);
                    namespace.setvar(runv,mid2);
                    var ergmid2=evaluate(v1);
                    
                    var ab = limit(ergmid1.value.real);
                    var bc = limit(ergmid2.value.real);
                    var dd1 = Math.abs(a + b - 2 * ab) / (pxlstep);
                    var dd2 = Math.abs(b + c - 2 * bc) / (pxlstep);
                    drawit=drawit && dd1<1 && dd2<1;
                    
            
            }
            if (drawit) {  // Refinement sieht gut aus ---> malen
                drawstroke(x1, mid, y1, ergmid, step / 2);
                drawstroke(mid, x2, ergmid, y2, step / 2);
                
            } else {  //Refinement zu grob weiter verfeinern
                drawrec(x1, mid, y1, ergmid, step / 2);
                drawrec(mid, x2, ergmid, y2, step / 2);
            }
            return;
        }

        //Übergange con drawable auf nicht drawable

        drawrec(x1, mid, y1, ergmid, step / 2);

        drawrec(mid, x2, ergmid, y2, step / 2);

    
    }
    var xo,vo,x,v;
    
    var stroking=false;
    for(var xx=start;xx<stop+step;xx=xx+step){

        x=Number.real(xx)
        namespace.setvar(runv,x);
        v=evaluate(v1);
    
        if(x.value.real>start){
            drawrec(xo,x,vo,v,step);
        
        }
        xo=x;        
        vo=v;        
                    
        
    }
    
//    console.log(count);
    
 //   csctx.stroke();

    namespace.removevar(runv);
    if(stroking)
        csctx.stroke();

    return nada;
    
}



evaluator.plotX=function(args,modifs){ //OK
    

    var v1=args[0];
    var li=evaluator.helper.plotvars(v1);
    var runv="#";
    if(li.indexOf("t")!=-1) {runv="t"};
    if(li.indexOf("z")!=-1) {runv="z"};
    if(li.indexOf("y")!=-1) {runv="y"};
    if(li.indexOf("x")!=-1) {runv="x"};


    namespace.newvar(runv);
    var start=-10;
    var stop=10;
    var step=.01;
    var m=csport.drawingstate.matrix;
    var col=csport.drawingstate.linecolor
    csctx.fillStyle=col;
    csctx.lineWidth = 1;
    csctx.lineCap = 'round';

    var stroking=false;

    for(var x=start;x<stop;x=x+step){
        namespace.setvar(runv,Number.real(x));
        
        var erg=evaluate(v1);
        if(erg.ctype=="number"){
            var y=+erg.value.real;
            var xx=x*m.a-y*m.b+m.tx;
            var yy=x*m.c-y*m.d-m.ty;
            if(!stroking){
                csctx.beginPath();
                csctx.moveTo(xx, yy);
                stroking=true;
            } else {
                csctx.lineTo(xx, yy);
            }
            
        }
        
        
    }
    csctx.stroke();

    namespace.removevar(runv);
    

    return nada;
    
}


evaluator.helper.plotvars=function(a){
    var merge=function(x,y){
        var obj = {};
        for (var i = x.length-1; i >= 0; -- i)
            obj[x[i]] = x[i];
        for (var i = y.length-1; i >= 0; -- i)
            obj[y[i]] = y[i];
        var res = []
            for (var k in obj) {
                if (obj.hasOwnProperty(k))  // <-- optional
                    res.push(obj[k]);
            }
        return res;
    }
    
    var remove=function(x,y){

    for (var i = 0; i < x.length; i++) {
        if (x[i] === y) {
            x.splice(i, 1);
            i--;
        }
    }
    return x;
    }
    
    if(a.ctype=="variable"){
       return [a.name];
    }
    
    if(a.ctype=='infix'){
        var l1=  evaluator.helper.plotvars(a.args[0]);
        var l2=  evaluator.helper.plotvars(a.args[1]);
        return merge(l1,l2);
    }

    if(a.ctype=='list'){
        var els=a.value;
        var li=[];
        for(var j=0;j<els.length;j++) {
            var l1= evaluator.helper.plotvars(els[j]);
            li=merge(li,l1);
        }
        return li;
    }
    
    if(a.ctype=='function'){
        var els=a.args;
        var li=[];
        for(var j=0;j<els.length;j++) {
            var l1=evaluator.helper.plotvars(els[j]);
            li=merge(li,l1);
            
        }
        if((  a.oper=="apply"  //OK, das kann man eleganter machen, TODO: irgendwann
            ||a.oper=="select"
            ||a.oper=="forall"
            ||a.oper=="sum"
            ||a.oper=="product"
            ||a.oper=="repeat"
            ||a.oper=="min"
            ||a.oper=="max"
            ||a.oper=="sort"
        ) 
        && a.args[1].ctype=="variable"){
            li=remove(li,a.args[1].name);
        }
        return li;
    }

    return [];


}

