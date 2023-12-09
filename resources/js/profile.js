document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');

    profileForm.addEventListener('submit', async function() {
        submitForm(profileForm, '/api/update-profile');
    });

    passwordForm.addEventListener('submit', async function() {
        submitForm(passwordForm, '/api/update-password');
    });
});

function editProfile() {
    document.getElementById('profile-info').style.display = 'none';
    document.getElementById('edit-profile').style.display = 'block';
    document.getElementById('edit-password').style.display = 'block';
}

async function submitForm(form, url) {
    const formData = new URLSearchParams(new FormData(form)).toString();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

