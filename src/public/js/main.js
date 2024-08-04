

$(function () {
    // socket.io client side connection
    const socket = io.connect();

    // obtaining DOM elements from the Chat interface
    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#chat');

    // obtaining DOM elements from the NicknameForm Interface
    const $nickForm = $('#nickForm');
    const $nickname = $('#nickname');
    const $nickError = $('#nickError');
    const $disconnect = $('#disconnect');
    
    // obtaining the current user
    let $currentUser = '';
    // obtaining the usernames container DOM
    const $users = $('#usernames');

    $disconnect.submit(() => {
        socket.emit('disconnect');
    });

    $nickForm.submit( e => {
        e.preventDefault();
        $currentUser = $nickname.val();
        $currentTime = Date.now();
        socket.emit('new user', $nickname.val(), data => {
            if (data) {
                $('#created').val(`${new Date($currentTime)}`);
                $('#nickWrap').hide();
                $('#contentWrap').show();
                $('#message').focus();
                $('#disconnect').show();
            }
            else {
                $nickError.html(`
                    <div class="alert alert-danger">
                        That username already exist
                    </div>`);
            }
        });
        $nickname.val('');
    });

    //events
    $messageForm.submit( e => {
        e.preventDefault();
        socket.emit('send message', $messageBox.val(), data => {
            $chat.append(`<p class="error">${data}</p>`);
        });
        $messageBox.val('');
    });

    socket.on('new message', data => {
        $chat.append(`${displayData(data)}<br/>`);
    });

    socket.on('usernames', data => {
        let html = '';
        for (let i = 0; i < data.length; i++) {
            if (data[i] === $currentUser) {
                html += `<p class="current-user"><i class="fa fa-fw fa-user"></i>${data[i]}</p>`;
            } else {
                html += `<p><i class="fa fa-fw fa-user"></i>${data[i]}</p>`;
            }
            //html += '<p><i class="fa fa-fw fa-user"></i>' + data[i] + '  -  ' + $currentUser + '</p>';
        }
        $users.html(html);
    });

    socket.on('whisper', data => {
        $chat.append(`${displayWhisper(data, '<i class="fa fa-fw fa-eye-slash"></i>')}`);
    });

    socket.on('load old msgs', msgs => {
        for (let i = msgs.length -1; i >= 0; i--) {
            displayMsg(msgs[i]);
        }
    });

    function displayMsg(data) {
        let t = getRemainTime(data.created_at);
        let span = '';

        if (t.remainSeconds < 60 && t.remainMinutes == 0 && t.remainHours == 0) {
            span = `A moments ago`;    
        } else if (t.remainMinutes < 60 && t.remainHours == 0) {
            if (t.remainMinutes < 10) {
                if (t.remainMinutes == 01) {
                    span = `${(t.remainMinutes).slice(-1)} minute ago`;
                } else {
                    span = `${(t.remainMinutes).slice(-1)} minutes ago`;
                } 
            } else { 
                span = `${t.remainMinutes} minutes ago`;
            }
        } else if (t.remainHours < 24 && t.remainDays == 0) {
            if (t.remainHours < 10) {
                if (t.remainHours == 01) {
                    span = `${(t.remainHours).slice(-1)} hour ago`;
                } else {
                    span = `${(t.remainHours).slice(-1)} hours ago`;
                } 
            } else { 
                span = `${t.remainHours} hours ago`;
            }
        } else if (t.remainDays < 365) {
            if (t.remainDays < 10) {
                if (t.remainDays == 01) {
                    span = `yesterday`;
                } else {
                    span = `${(t.remainDays).slice(-1)} days ago`;
                } 
            } else { 
                span = `${t.remainDays} days ago`;
            }   
        } else {
            span = `A long time ago`;    
        }    
        $chat.append(`${displayWhisper(data, span)}`); 
    }

    function displayWhisper(data, span) {
        return (`<p class="whisper">${displayData(data)}<span class="float-right">${span}</span></p>`);
    }

    function displayData(data) {
        return (`<b>${data.nick}</b>: ${data.msg}`);
    }

    const getRemainTime = deadline => {
        let now = new Date(),
            remainTime = (now - new Date(deadline) + 1000) / 1000,
            remainSeconds = ('0' + Math.floor(remainTime % 60)).slice(-2),
            remainMinutes = ('0' + Math.floor(remainTime / 60 % 60)).slice(-2),
            remainHours = ('0' + Math.floor(remainTime / 3600 % 24)).slice(-2),
            remainDays = Math.floor(remainTime / (3600 * 24));
        
        return {
            remainTime,
            remainSeconds,
            remainMinutes,
            remainHours,
            remainDays	
        }
    };
});