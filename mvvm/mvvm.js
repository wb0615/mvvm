class Dep {
    constructor(){
        this.listener=[];
    }
    addListener(obj){
        this.listener.push(obj)
        console.log(this.listener)
    }
    changeWatch(){
        this.listener.forEach(val=>{
            val.sendval()
        })
    }
}
Dep.terget = null
const  dep = new Dep()
class Watcher {
    constructor(data,contentText,ck){
        Dep.terget = this
        this.data=data;
        this.ck=ck
        this.contentText=contentText;
        this.init()
    }
    init(){
        this.value = utils.getvalue(this.data,this.contentText)
        Dep.terget=null
    }
    sendval(){
        this.init()
        this.ck(this.value)
    }
}

class Observer{
    constructor(data){
        if(!data || typeof data !== 'object'){
            return ;
        }
        this.data=data
        this.init()
    }
    init(){
        Object.keys(this.data).forEach(val=>{
            this.observer(this.data,val,this.data[val])
        })
    }
    observer(obj,key,val){
        new Observer(obj[key])
        Object.defineProperty(obj,key,{
            get(){
                if(Dep.terget){
                    dep.addListener(Dep.terget)
                }
                return val
            },
            set(newval){
                if(val === newval){
                    return ;
                }
                val=newval
                dep.changeWatch()
                new Observer(val)
            }
        })
    }
}


//node.nodeValue这个是标签上的属性的属性值 ，。。对于属性节点，nodeValue 属性包含属性值
//而node.value是属性值里面的值，真正的内容

const utils = {
    setvalue(node,data,value){
        console.dir(node,'node')
        node.value=this.getvalue(data,value)
       
    },
    getvalue(data,val){
        if(val.indexOf('.')>-1){
            let arr= val.split('.');
            for(var i=0;i<arr.length;i++){
                data=data[arr[i]]
            }
            return data
        }else{
            return data[val]
        }
    },
    getContent(node,data,contentText){
        node.textContent=this.getvalue(data,contentText);   
    },
    changevalue(data,key,value){
        if(key.indexOf('.')>-1){
            let arr= key.split('.');
            for(var i=0;i<arr.length-1;i++){
                data=data[arr[i]]
            }
            data[arr[arr.length-1]]=value
        }else{
            data[key]=value
        }
    }
}





class Mvvm{
    constructor({el,data}){
        
        this.el=el;
        this.data=data;
        this.init()
        this.initDom()
    }
    init(){
        Object.keys(this.data).forEach(val=>{
            this.observer(this,val,this.data[val])
            
        })
        new Observer(this.data)
    }
    observer(obj,key,val){
        console.log(this,'this')
        Object.defineProperty(obj,key,{
            get(){
                return val
            },
            set(newval){
                val=newval
            }
        })
    }
    initDom(){
        this.$el=document.getElementById(this.el);
        let newfargment = this.createfargment()
        this.compiles(newfargment)
        this.$el.appendChild(newfargment)
    }
    createfargment(){
        let fargment = document.createDocumentFragment()
        let firstChild;
        while(firstChild = this.$el.firstChild){
            fargment.appendChild(firstChild)
        }
        return fargment
    }
    compiles(node){
        if(node.nodeType === 1){
            let attributes = node.attributes;
            Array.from(attributes).forEach(val=>{
                if(val.nodeName==='v-model'){
                    node.addEventListener('input',(e)=>{
                
                        utils.changevalue(this.data,val.nodeValue,e.target.value)
                    })
                    utils.setvalue(node,this.data,val.nodeValue)
                }
            })
        }else if(node.nodeType === 3) {
            // {{inpval}}
            let contentText = node.textContent.indexOf('{{')>-1 && node.textContent.split('{{')[1].split("}}")[0];
            contentText && utils.getContent(node, this.data, contentText)
            contentText && new Watcher(this.data, contentText,(newval)=>{

                node.textContent=newval
            })
        }

        if(node.childNodes && node.childNodes.length>0){
            node.childNodes.forEach(val =>{
                this.compiles(val)
            })
        }
    }
}