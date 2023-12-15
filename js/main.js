window.addEventListener('DOMContentLoaded',()=>{
    const modal = $('.modal')
    // modal.hide()
    $('.buy-btn').on('click',()=>{
       
        modal.show()
    })
    $('.cancel-btn').on('click',()=>{
        modal.hide()
    })

})
   