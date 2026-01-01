// === Custom Notification System ===
function showNotification(message, type = 'info', title = '', isPasswordReset = false) {
    const container = document.getElementById('notificationContainer');

    // Terapkan judul default
    if (!title) {
        if (type === 'success') title = 'Berhasil!';
        else if (type === 'error') title = 'Terjadi Kesalahan';
        else title = 'Informasi';
    }

    // Icon mapping
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ⓘ'
    };

    // Buat notifikasi HTML
    container.innerHTML = `
        <div class="notification-overlay" onclick="closeNotification()"></div>
        <div class="notification-modal" data-reset-password="${isPasswordReset}">
            <div class="notification-icon ${type}">
                ${icons[type] || icons.info}
            </div>
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-button" onclick="closeNotification()">OK</button>
        </div>
    `;

    container.classList.add('active');

    // Bisa ditutup dengan Esc atau Enter
    document.addEventListener('keydown', handleNotificationKey);
}

function closeNotification() {
    const container = document.getElementById('notificationContainer');
    container.classList.remove('active');
    document.removeEventListener('keydown', handleNotificationKey);

    //Jika notifikasi untuk reset password, maka kembali ke form login 
    const modal = container.querySelector('.notification-modal');
    if (modal && modal.dataset.resetPassword === 'true') {
        showForm(document.getElementById('loginForm'));
        // Reset Lupa Password step
        document.getElementById('forgotStep1').style.display = 'block';
        document.getElementById('forgotStep2').style.display = 'none';
        document.getElementById('forgotStep3').style.display = 'none';
    }
}

function handleNotificationKey(e) {
    // Hanya tangani jika notifikasi aktif
    const container = document.getElementById('notificationContainer');
    if (!container.classList.contains('active')) return;

    if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault(); // Prevent default action
        e.stopPropagation(); // Stop event dari bubbling
        closeNotification();
    }
}

// Tampilkan tahun saat ini di footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');

const btnToRegisterFromLogin = document.getElementById('btnToRegisterFromLogin');
const btnToLoginFromRegister = document.getElementById('btnToLoginFromRegister');
const btnToLoginFromForgot = document.getElementById('btnToLoginFromForgot');
const btnToForgot = document.getElementById('btnToForgot');

const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const btnSendCode = document.getElementById('btnSendCode');
const btnResetPassword = document.getElementById('btnResetPassword');

const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const forgotError = document.getElementById('forgotError');
const forgotSuccess = document.getElementById('forgotSuccess');

const forgotStep1 = document.getElementById('forgotStep1');
const forgotStep2 = document.getElementById('forgotStep2');

// State for OTP
let generatedOTP = null;
let otpEmail = null;

// --- Navigasi Fungsi ---
function showForm(form) {
    // Hilangkan semua form
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');
    forgotForm.classList.remove('active');
    // Tampilkan form yang diminta
    form.classList.add('active');
    // Bersihkan error 
    clearErrors();
    // Bersihkan Input (Reset sesmua form)
    loginForm.reset();
    registerForm.reset();
    forgotForm.reset();

    // Hapus semua custom error bubbles
    document.querySelectorAll('.custom-error-bubble').forEach(e => e.remove());
    document.querySelectorAll('.input-error-shake').forEach(e => e.classList.remove('input-error-shake'));
}

function clearErrors() {
    loginError.innerText = "";
    registerError.innerText = "";
    forgotError.innerText = "";
    forgotSuccess.innerText = "";
}

btnToRegisterFromLogin.addEventListener('click', () => showForm(registerForm));
btnToLoginFromRegister.addEventListener('click', () => showForm(loginForm));
btnToLoginFromForgot.addEventListener('click', () => showForm(loginForm));
btnToForgot.addEventListener('click', () => {
    showForm(forgotForm);
    // Reset forgot flow
    document.getElementById('forgotSubtitle').innerText = "Masukkan email anda untuk menerima kode OTP.";
    forgotStep1.style.display = 'block';
    forgotStep2.style.display = 'none';
    forgotStep3.style.display = 'none';
    generatedOTP = null;
});

// --- LocalStorage "Database" Helpers ---
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function saveUser(user) {
    const users = getUsers();
    // Tambahkan properti hasLoggedIn untuk user baru
    user.hasLoggedIn = false;
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

function findUser(email) {
    const users = getUsers();
    return users.find(u => u.email === email);
}

function updateUserPassword(email, newPassword) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }
    return false;
}

// --- Validasi Helpers ---
function isValidEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}

// --- Register Logic ---
btnRegister.addEventListener('click', () => {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    const emailInput = document.getElementById('regEmail');

    // Gunakan reportValidity untuk validasi bawaan browser
    if (!emailInput.reportValidity()) {
        return;
    }

    if (!name) {
        registerError.innerText = "Nama wajib diisi!";
        return;
    }
   
    if (!email || !isValidEmail(email)) {
       
    }

    if (!password) {
        registerError.innerText = "Password wajib diisi!";
        registerError.classList.add('shake');
        setTimeout(() => registerError.classList.remove('shake'), 500);
        return;
    }

    if (findUser(email)) {
        registerError.innerText = "Email sudah terdaftar!";
        registerError.classList.add('shake');
        setTimeout(() => registerError.classList.remove('shake'), 500);
        return;
    }

    // Save user
    const newUser = { name, email, password };
    saveUser(newUser);

    showNotification(`Akun berhasil dibuat untuk <strong>${name}</strong>!<br>Silahkan login.`, 'success');
    setTimeout(() => {
        closeNotification();
        showForm(loginForm);
    }, 1500);
});

// --- Login Logic ---
btnLogin.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const emailInput = document.getElementById('loginEmail');
    if (!emailInput.reportValidity()) return;

    if (!email || !password) {
        loginError.innerText = "Mohon isi email dan password!";
        loginError.classList.add('shake');
        setTimeout(() => loginError.classList.remove('shake'), 500);
        return;
    }

    const user = findUser(email);
    if (user && user.password === password) {
        // Check jika user sudah pernah login sebelumnya
        const greeting = user.hasLoggedIn ? "Selamat datang kembali," : "Selamat datang,";
        showNotification(`${greeting}<br><strong>${user.name}</strong>!`, 'success');

        // MarkTandai user jika ini adalah login pertama kali
        if (!user.hasLoggedIn) {
            user.hasLoggedIn = true;
            // Update user di localStorage
            const users = getUsers();
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex !== -1) {
                users[userIndex] = user;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }

    } else {
        loginError.innerText = "Email atau password salah!";
        loginError.classList.add('shake');
        setTimeout(() => loginError.classList.remove('shake'), 500);
    }
});

// ---Forgot Password Element ---
const forgotStep3 = document.getElementById('forgotStep3');
const btnVerifyOTP = document.getElementById('btnVerifyOTP');

// --- Forgot Password Logic ---
btnSendCode.addEventListener('click', () => {
    const email = document.getElementById('forgotEmail').value;

    const emailInput = document.getElementById('forgotEmail');
    if (!emailInput.reportValidity()) return;

    if (!email) {
        forgotError.innerText = "Masukkan email anda!";
        return;
    }

    const user = findUser(email);
    if (!user) {
        forgotError.innerText = "Email tidak ditemukan!";
        return;
    }

    // Generate secara random 6-digit OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    otpEmail = email;

    // Kirim Email via EmailJS
    const expiryTime = new Date(new Date().getTime() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const templateParams = {
        to_email: email,
        to_name: user.name,
        passcode: generatedOTP,
        time: expiryTime
    };

    btnSendCode.innerText = "Mengirim...";

    emailjs.send('service_0tvjeie', 'template_n54m3rt', templateParams)
        .then(function (response) {
            console.log('SUCCESS!', response.status, response.text);
            forgotSuccess.innerText = "Kode terkirim ke email anda!";
            forgotError.innerText = "";

            document.getElementById('forgotSubtitle').innerText = "Masukkan kode OTP yang telah dikirim ke email anda.";
            forgotStep1.style.display = 'none';
            forgotStep2.style.display = 'block';
            forgotStep2.classList.add('step-enter');
            setTimeout(() => forgotStep2.classList.remove('step-enter'), 600);

            btnSendCode.innerText = "Kirim Kode";
        }, function (error) {
            console.log('FAILED...', error);
            showNotification('Gagal mengirim email. Silahkan coba lagi.', 'error');
            btnSendCode.innerText = "Kirim Kode";
        });
});

// Step 2: Verify OTP
btnVerifyOTP.addEventListener('click', () => {
    const inputCode = document.getElementById('otpCode').value;

    if (inputCode !== generatedOTP) {
        forgotError.innerText = "Kode OTP salah!";
        forgotError.classList.add('shake');
        setTimeout(() => forgotError.classList.remove('shake'), 500);
        return;
    }

    // OTP Benar  -> Bersihkan error dan tampilkan sukses
    forgotError.innerText = "";
    forgotSuccess.innerText = "Kode benar! Silahkan buat password baru.";
    document.getElementById('forgotSubtitle').innerText = "Buat password baru untuk akun anda.";
    forgotStep2.style.display = 'none';
    forgotStep3.style.display = 'block';
    forgotStep3.classList.add('step-enter');
    setTimeout(() => forgotStep3.classList.remove('step-enter'), 600);
});

// Step 3: Reset Password
btnResetPassword.addEventListener('click', () => {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!newPassword || !confirmPassword) {
        forgotError.innerText = "Mohon isi semua kolom password!";
        forgotError.classList.add('shake');
        setTimeout(() => forgotError.classList.remove('shake'), 500);
        return;
    }

    if (newPassword !== confirmPassword) {
        forgotError.innerText = "Password tidak cocok!";
        forgotError.classList.add('shake');
        setTimeout(() => forgotError.classList.remove('shake'), 500);
        return;
    }

    // Update password
    const success = updateUserPassword(otpEmail, newPassword);
    if (success) {
        showNotification('Password berhasil diubah!<br>Silahkan login.', 'success', '', true);

    } else {
        forgotError.innerText = "Terjadi kesalahan sistem.";
    }
});

// --- Helper: Trigger Button Click untuk Enter Key ---
function addEnterListener(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    if (input && button) {
        input.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                button.click();
            }
        });
    }
}

// Terapkan ke semua form input
addEnterListener("loginEmail", "btnLogin");
addEnterListener("loginPassword", "btnLogin");

addEnterListener("regName", "btnRegister");
addEnterListener("regEmail", "btnRegister");
addEnterListener("regPassword", "btnRegister");

addEnterListener("forgotEmail", "btnSendCode");
addEnterListener("otpCode", "btnVerifyOTP");
addEnterListener("newPassword", "btnResetPassword");
addEnterListener("confirmPassword", "btnResetPassword");

// --- Custom "Premium" Validasi UI ---
const inputs = document.querySelectorAll('input');

inputs.forEach(input => {
    // 1. Sembunyikan popup bawaan browser dan tampilkan custom bubble
    input.addEventListener('invalid', (e) => {
        e.preventDefault(); // STOP the native browser popup

        // Input getar untuk feedback
        input.classList.add('input-error-shake');
        setTimeout(() => input.classList.remove('input-error-shake'), 400);

        // Tampilkan custom bubble
        showCustomBubble(input, input.validationMessage);
    });

    // 2. Hapus bubble saat user mulai mengetik
    input.addEventListener('input', () => {
        removeCustomBubble(input);
    });
});

function showCustomBubble(input, message) {
    // Hapus bubble lama jika ada
    removeCustomBubble(input);

    // Buat elemen bubble
    const bubble = document.createElement('div');
    bubble.className = 'custom-error-bubble bubble-enter';
    bubble.innerText = message;

    const rect = input.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    input.parentNode.insertBefore(bubble, input.nextSibling);

    bubble.style.marginTop = "5px";
    bubble.style.position = "absolute";

    bubble.style.top = (input.offsetTop + input.offsetHeight) + "px";
    bubble.style.left = input.offsetLeft + "px";
    bubble.style.width = (input.offsetWidth - 20) + "px"; // Lebar sedikit lebih kecil dari input

    // Simpan referensi bubble pada input
    input.activeBubble = bubble;
}

function removeCustomBubble(input) {
    if (input.activeBubble) {
        input.activeBubble.remove();
        input.activeBubble = null;
    }
}
