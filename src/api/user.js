import request from '@/utils/request'
// 登录请求
export const login =(user)=>{
    return request({
        url:"/admin/acl/index/login",
        method:"POST",
        data:user
    })
}
// 退出登录请求
export const logout=()=>{
    return request({
        url:"/admin/acl/index/logout",
        method: "post",
        
    })
}
// 获取用户信息
export const getInfo=(token)=>{
    return request({
        url:"/admin/acl/index/info",
        method: "get",
        params: { token }
    })
}