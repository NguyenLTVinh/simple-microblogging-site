document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateLikeCounts, 500);
    var likeButtons = document.querySelectorAll('[id^="like-btn-"]');
    // Code below prevents going to post when clicked on like button
    likeButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            likePost(this.id.replace('like-btn-', ''));
            event.stopPropagation();
        });
    });
    // Formatting the time
    var dateElements = document.querySelectorAll('.date-time');
        dateElements.forEach(function(element) {
            var date = new Date(element.textContent);
            element.textContent = date.toLocaleString();
        });
});

function goToPost(postId) {
    window.location.href = `/post/${postId}`;
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
            let currentCount = parseInt(likeCountElement.innerText) || 0;
            if (likeButton.dataset.liked === 'true') {
                currentCount--;
                likeButton.dataset.liked = 'false';
            } else {
                currentCount++;
                likeButton.dataset.liked = 'true';
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