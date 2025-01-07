document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateLikeCounts, 500);
    updateLikeButtonStyles();
    var likeButtons = document.querySelectorAll('[id^="like-btn-"]');
    // Code below prevents going to post when clicked on like button
    likeButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
            likePost(this.id.replace('like-btn-', ''));
            event.stopPropagation();
        });
    });
    // Formatting the time
    var dateElements = document.querySelectorAll('.date-time');
    dateElements.forEach(function (element) {
        var date = new Date(element.textContent);
        element.textContent = date.toLocaleString();
    });
    // To save sort options by storing in session storage
    const sortOptions = document.querySelector('.sort-options');
    const savedSortValue = sessionStorage.getItem('selectedSort');
    if (savedSortValue) {
        sortOptions.value = savedSortValue;
    }
    sortOptions.addEventListener('change', function() {
        sessionStorage.setItem('selectedSort', this.value);
    });
});

function goToPost(postId) {
    window.location.href = `/post/${postId}`;
}

function updateLikeButtonStyles() {
    const likeButtons = document.querySelectorAll('[id^="like-btn-"]');
    likeButtons.forEach(button => {
        const isLiked = button.dataset.liked === 'true';
        const icon = button.querySelector('i');
        if (isLiked) {
            icon.style.color = '#ffd700';
        } else {
            icon.style.color = 'white';
        }
    });
}

async function likePost(postId) {
    try {
        const likeButton = document.getElementById(`like-btn-${postId}`);
        const likeCountElement = document.getElementById(`like-count-${postId}`);

        if (likeButton.dataset.isCoolingDown === 'true') {
            return;
        }
        likeButton.dataset.isCoolingDown = 'true';
        likeButton.disabled = true;
        likeButton.classList.add('button-disabled');

        const response = await fetch(`api/like-post/${postId}`, { method: 'POST' });

        if (response.status === 403) {
            // User is not logged in, redirect to the login page
            window.location.href = '/login';
            return;
        }

        if (response.ok) {
            const icon = likeButton.querySelector('i');
            let currentCount = parseInt(likeCountElement.innerText) || 0;
            if (likeButton.dataset.liked === 'true') {
                currentCount--;
                likeButton.dataset.liked = 'false';
                icon.style.color = 'white'
            } else {
                currentCount++;
                likeButton.dataset.liked = 'true';
                icon.style.color = '#ffd700'
            }
            //likeCountElement.innerText = currentCount;
        }

        setTimeout(() => {
            likeButton.dataset.isCoolingDown = 'false';
            likeButton.disabled = false;
            likeButton.classList.remove('button-disabled');
        }, 1500);

    } catch (err) {
        console.error('Error:', err);
    }
}

async function updateLikeCounts() {
    try {
        const response = await fetch('/api/like-counts');
        const likeCounts = await response.json();

        for (const postId in likeCounts) {
            const likeCountElement = document.getElementById(`like-count-${postId}`);
            if (likeCountElement) {
                likeCountElement.innerText = likeCounts[postId];
            }
        }
    } catch (err) {
        console.error(err);
    }
}