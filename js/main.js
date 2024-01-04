window.addEventListener('DOMContentLoaded',()=>{
    $('#connect1').on('click',(e)=>{
        e.preventDefault()
        $('.profiles-container').addClass('showProf')
    })
    $('#closeProfiles').on('click',()=>{
        $('.profiles-container').removeClass('showProf')
    })
    const modal = $('.modal')
    // modal.hide()
    const serverUrl = 'https://www.konnektsmartlife.net'
    const OK = 200;
    let display = $('.package-container')
    
    $.ajax({
        type:'GET',
        url:`${serverUrl}/api/profiles`,
        success:function(data){
            
             
            // let result = data.filter(data.name=='UNLIMITED')
            // console.log(data)
           $('.profiles-container-body').append('<div class="package-container"></div>')
            data.forEach((record)=>{
                let temp = `
                <div class="package">
                    <h2>${record.name}</h2>
                    <div class="description">
                        <p><i class="bi bi-hourglass-top"></i><strong>${record.name.split(' ')[0]}</strong></p>
                        <p><i class="bi bi-cash"></i><strong>${record.amount}KSH</strong></p>
                        <p><i class="bi bi-phone"></i><strong>${record.devices} DEVICE</strong></p>
                    </div>
                    <button class="buy-btn" data-amount=${record.amount} data-name=${JSON.stringify(record.name)} data-devices=${record.devices} data-duration=${record.name.split(' ')[0]}>BUY</button>
                </div>
                `
                let display = $('.package-container')
                display.append(temp)
                $('.loading').hide()
            })
            
            
            // modal.hide()
            $('.buy-btn').on('click',function(){   
                modal.show()
                scrollToTop()
                let amount = $(this).data('amount')
                let name = $(this).data('name')
                let devices = $(this).data('devices')
                let duration = $(this).data('duration')
                
                let temp2 = `
                    <legend>Checkout</legend>
                    <div class="payment-description">
                        <p class="main"> ${name}</p>
                        <p><i class="bi bi-hourglass-top"></i><strong>${duration}</strong></p>
                        <p><i class="bi bi-cash"></i><strong> ${amount} KSH</strong></p>
                        <p><i class="bi bi-phone"></i><strong> ${devices} DEVICES</strong></p>
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
                $('#checkout').html(temp2)

                const numberRegex = /^\d{10}$/;
                const phone = $('#phone');
                const buyButton = $('#buy');
                let isRequestSent = false;

                buyButton.on('click', () => {
                    const phoneNumber = phone.val();                  
                    if (!numberRegex.test(phoneNumber)) {
                        phone.addClass('error');
                        showSnackbar(`Invalid phone number`);
                        $('#buy').prop('disabled', true);
                    } else {
                        
                        $('#buy').prop('disabled', false);
                        $('#checkout').on('submit', async () => {
                            let payload = {
                                value: $('#checkout').find('input[name="value"]').val(),
                                amount: $('#checkout').find('input[name="amount"]').val(),
                                phone: $('#checkout').find('input[name="phone"]').val(),
                            };                       
                            console.log(payload);
                            showSnackbar(`Processing Payment Please Wait`);
                        
                            try {
                                if (!isRequestSent) {
                                const response = await $.ajax({
                                    type: 'POST',
                                    url: `${serverUrl}/api/hotspot/send`,
                                    data: payload,
                                });
                        
                                console.log(response);
                        
                                if (response.status === 400) {
                                    
                                    return;
                                }
                                isRequestSent = true;
                                wait()
                               await checkOutIDCheck(response.checkOutId);
                                modal.hide();                                
                            }
                            if(isRequestSent==='true')
                                window.location.reload();
                            } catch (err) {
                                $('.loader3').hide();
                                showSnackbar(`Cannot Process Request At The Moment`);
                            }finally {
                                isRequestSent = false;  // Reset the flag after the request is completed
                            }          
                            async function checkOutIDCheck(checkoutId) {
                                const pollInterval = 3000; // Poll every 3 seconds (adjust as needed)
                                const maxAttempts = 10; // Set a maximum number of attempts
                                let attempts = 0;
                                let conditionMet = false; // Flag to track whether the condition is met
                            
                                const checkStatus = async () => {
                                    try {
                                        const response = await $.ajax({
                                            type: 'post',
                                            url: `${serverUrl}/api/hotspot/check/${checkoutId}`,
                                        });
                            
                                        if (response.result.ResultCode === '0') {
                                            console.log(response);
                                            await addUser();
                                            showSnackbar('YOU ARE LOGGED IN');
                                            conditionMet = true; // Set the flag to true when the condition is met
                                        } else {
                                            console.log(response.result);
                                            conditionMet = true;
                                            showSnackbar('An Error occured at your end');
                                            // Set the flag to true when the condition is met

                                        }
                                    } catch (error) {
                                        console.error(error);
                                        showSnackbar('Rertying');
                                         // Set the flag to true when the condition is met
                                         
                                    }
                                };
                            
                                const poll = async () => {
                                    if (!conditionMet && attempts < maxAttempts) {
                                        attempts++;
                            
                                        await checkStatus();
                            
                                        // Check again after a delay
                                        setTimeout(poll, pollInterval);
                                    } else {
                                        
                                            showSnackbar('Cannot Verify Payment');
                                        
                                    }
                                };
                            
                                // Start the polling process
                                await poll();
                            }
                            
                        
                            async function addUser() {

                                try {
                                    const response = await $.ajax({
                                        type: 'post',
                                        url: `${serverUrl}/api/hotspot/add-user`,
                                        data: payload,
                                    });
                                    console.log(response)
                                    if (response.status === 200) {
                                        showSnackbar('You will be logged in shortly');
                                        let pushResponse = response;
                                        console.log(pushResponse)
                                        let username = pushResponse.code;
                                        autoLogin(username);
                                    } else {
                                        showSnackbar('Invalid checkout ID');
                                    }
                                } catch (error) {
                                    console.error(error);
                                    showSnackbar('Error adding user');
                                }
                            }
                        });
                        
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
        // document.getElementById('snack-action')
        //     .innerHTML = `${buttonText}`;
    
        // if (!buttonText) {
        //     document.getElementById('btn-snack-action')
        //         .classList.add('hidden');
        // }
        // if (event) {
        //     document.getElementById('btn-snack-action')
        //         .addEventListener('click', (e) => {
        //             e.preventDefault();
        //             event();
        //         });
        // }
        snackbar.classList.add('show');
        setTimeout(function () {
            snackbar.classList.remove("show");
        }, 6200);

    }

   
    function autoLogin(code) {
        console.log(code);
        document.getElementById('txt-code')
            .value = code;
        doLogin();
    }
   function  wait(){
    $('.wait').show()
    showSnackbar('Processing')
    setTimeout(()=>{   
        $('.wait').hide()
        $('.profiles-container').hide()
        scrollToTop()
    },3000)
   }
 
  function scrollToTop(){
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
  }
  scrollToTop()
  function updateDateTime() {
    var currentDate = new Date();
    var dateString = currentDate.toDateString();
    var timeString = currentDate.toLocaleTimeString();

    var dateTimeString = dateString + ' ' + timeString;
    document.getElementById('dateTime').innerHTML = dateTimeString;
}

// Update the date and time every second
setInterval(updateDateTime, 1000);

// Initial update
updateDateTime();
})
   