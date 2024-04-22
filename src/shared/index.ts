export const extend = Object.assign;

export const Empty_OBJ = {};
export const isObject = (val) => {
    return val !== null && typeof val === "object";
};

export const hasChanged =(val,newValue)=> {
    return !Object.is(val,newValue)
}
export const camelize = (str)=>{
    return str.replace(/-(\w)/g,(_,c)=>c?c.toUpperCase():"")
}
export const capitalize = str=>str.charAt(0).toUpperCase()+str.slice(1)
export const toHandlerKey = (str)=>{
    return  str?"on"+capitalize(str.slice(str)):""
}