window.addEventListener('DOMContentLoaded',()=>{
    const modal = $('.modal')
    // modal.hide()
    const serverUrl = 'https://www.konnektsmartlife.net'
    let checkoutId = ''
    const OK = 200;
    let paymentToken = ''
 
    let display = $('.package-container')
    $.ajax({
        type:'GET',
        url:`${serverUrl}/api/profiles`,
        success:function(data){
            console.log(data)
             
            // let result = data.filter(data.name=='UNLIMITED')
            // console.log(result)
           
            data.forEach((record)=>{
                let temp = `
                <div class="package">
                    <h2>${record.name}</h2>
                    <div class="description">
                        <p><i class="bi bi-hourglass-top"></i>${record.name.split(' ')[0]}</p>
                        <p><i class="bi bi-cash"></i>${record.amount}KSH</p>
                        <p><i class="bi bi-phone"></i>${record.devices} DEVICE</p>
                    </div>
                    <button class="buy-btn" data-amount=${record.amount} data-name=${JSON.stringify(record.name)} data-devices=${record.devices} data-duration=${record.name.split(' ')[0]}>BUY</button>
                </div>
                `
                display.append(temp)
                $('.loader').hide()
            })
            
            const dailybtn = $('.daily')
            // modal.hide()
            $('.buy-btn').on('click',function(){   
                modal.show()
                let amount = $(this).data('amount')
                let name = $(this).data('name')
                let devices = $(this).data('devices')
                let duration = $(this).data('duration')
                console.log(amount,name,devices,duration)
                let temp = `
                    <legend>Checkout</legend>
                    <div class="payment-description">
                        <p class="main"> ${name}</p>
                        <p><i class="bi bi-hourglass-top"></i> ${duration}</p>
                        <p><i class="bi bi-cash"></i> ${amount}KSH</p>
                        <p><i class="bi bi-phone"></i> ${devices} DEVICES</p>
                    </div>
                    <div class="payment-input-group">
                        <input type="number" placeholder="Phone Number" name="phone" id="phone" required>
                        <input type="number" maxLength="10"  hidden name="amount" required value=${amount}>
                        <input type="text" hidden name="value" required value=${JSON.stringify(name)}>


                    </div>
                    <div class="payment-input-group">
                        <input type="submit" value="BUY" id="buy">
                    </div>
                `
                $('#checkout').html(temp)

                const numberRegex = /^\d{10}$/;
                const phone = $('#phone');
                const buyButton = $('#buy');

                buyButton.on('click', () => {
                    const phoneNumber = phone.val();
                   

                    if (!numberRegex.test(phoneNumber)) {
                        phone.addClass('error');
                        showSnackbar(`Invalid phone number`);
                        $('#buy').prop('disabled', true);
                    } else {
                        $('.loader3').show()
                        $('#buy').prop('disabled', false);
                        $('#checkout').on('submit',()=>{
                            
                            $.ajax({
                                type:'POST',
                                url:`${serverUrl}/api/hotspot/send`,
                                data:$('#checkout').serialize(),
                                success:function(response){
                                    console.log($('#checkout').serialize())
                                    console.log(response)
                                    if(response.status === 400)
                                        showSnackbar(`Request failed, contact customer care`);
                                    // const pushResponse = JSON.parse(response);
                                    // checkoutId = pushResponse.clientCode;
                                    // autoLogin(checkoutId)
                                },
                                error:function(err){
                                    $('.loader3').hide()
                                    
                                    showSnackbar(`Cannot Process Request At The Moment`);
                                }

                            })
                        })
                    }
                });


            })
            

            $('.cancel-btn').on('click',()=>{
                modal.hide()
            })
        
        }
        
    })
    $('form').on('submit',(e)=>e.preventDefault())
    $('.loader2').hide()
    $('.daily').on('click',()=>showSnackbar(`Scroll Down`))
    $('.weekly').on('click',()=>showSnackbar(`Scroll Down`))
    $('.monthly').on('click',()=>showSnackbar(`Scroll Down`))
    function showSnackbar(message = '', buttonText = '', event) {

        const snackbar = document.querySelector('.mdc-snackbar');
        document.querySelector('.mdc-snackbar__label')
            .innerHTML = `${message}`;
        document.getElementById('snack-action')
            .innerHTML = `${buttonText}`;
    
        if (!buttonText) {
            document.getElementById('btn-snack-action')
                .classList.add('hidden');
        }
        if (event) {
            document.getElementById('btn-snack-action')
                .addEventListener('click', (e) => {
                    e.preventDefault();
                    event();
                });
        }
        snackbar.classList.add('show');
        setTimeout(function () {
            snackbar.classList.remove("show");
        }, 6200);
    }
    // const asyncCheckCode = async () => {
    //     console.log("Checking");
    //     try {
    //         const response = await fetch(`${URL2}/code?checkout=${checkoutId}`);
    //         if (response.ok) {
    //             return await response.text()
    //         } else {
    //             showSnackbar('Auto login error', 'Retry', retrieveCode);
    //             return ""
    //         }
    //     } catch (e) {
    //         console.log(e)
    //         showSnackbar(`${e}`);
    //         return ""
    //     }
    
    // }
   
    function autoLogin(code) {
        console.log(code);
        document.getElementById('txt-code')
            .value = code;
        doLogin();
    }
    function generateRandomAccount(length) {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding o,O,i,L,1,0
        const startChar = 'K';
      
        let genCode = '';
      
        for (let i = 1; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          genCode += characters.charAt(randomIndex);
        }
        let finalCode = genCode.toUpperCase()
      
        return finalCode;
      }
       ;
    const code = generateRandomAccount(6);
    console.log(code)
    let phoneNumber = "0110517055";
let newPhoneNumber = phoneNumber.slice(1);

console.log(newPhoneNumber);
  
})
   