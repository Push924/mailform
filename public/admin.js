async function loadInquiries() {
    try {
        const response = await fetch('/api/inquiries');
        const data = await response.json();

        if (data.success) {
            const inquiryList = document.getElementById('inquiryList');
            inquiryList.innerHTML = '';

            data.data.forEach(inquiry => {
                const date = new Date(inquiry.created_at).toLocaleString();
                const inquiryElement = document.createElement('div');
                inquiryElement.className = 'inquiry-item';
                inquiryElement.innerHTML = `
                    <h3>${inquiry.name}</h3>
                    <p class="inquiry-meta">이메일: ${inquiry.email}</p>
                    <p class="inquiry-meta">접수일시: ${date}</p>
                    <p>${inquiry.message}</p>
                `;
                inquiryList.appendChild(inquiryElement);
            });
        } else {
            alert('문의 목록을 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('문의 목록을 불러오는 중 오류가 발생했습니다.');
    }
}

// 페이지 로드 시 문의 목록 불러오기
document.addEventListener('DOMContentLoaded', loadInquiries);

// 1분마다 문의 목록 새로고침
setInterval(loadInquiries, 60000); 