(function () {
    function badgeColor(level) {
        if (!level) return '#888';
        if (level === '위험') return '#d9534f';
        if (level === '주의') return '#f0ad4e';
        return '#5cb85c';
    }

    function renderAnalysis(analysis, messageText, senderNumber) {
        const container = document.getElementById('analysisCard');
        if (!container) return;

        const badgeStyle = `background:${badgeColor(analysis.risk_level)};color:#fff;padding:4px 8px;border-radius:6px;display:inline-block;`;

        const officialUrlHtml = analysis.official_url 
            ? `<strong>공식 URL:</strong> <a href="${analysis.official_url}" target="_blank">${analysis.official_url}</a>` 
            : '';

        const senderStatusHtml = (analysis.sender_status && analysis.sender_status.toLowerCase() !== 'unknown')
            ? `<div style="margin-top:6px;font-size:18px;color:#000">상태: ${analysis.sender_status}</div>`
            : '';

        container.innerHTML = `
            <h3>의심 문자 결과</h3>

            <div class="analysis-card">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>발신번호:</strong> ${senderNumber || '알 수 없음'}<br>
                        <strong>원문:</strong>
                        <div class="message-box">${escapeHtml(messageText || '')}</div>
                    </div>

                <div style="text-align:right">
                    <div style="${badgeStyle}">${analysis.risk_level} \n 점수 ${analysis.total_score}</div>
                        ${senderStatusHtml}
                    </div>
                </div>

                <hr>

                <div style="margin-top:8px">
                    <strong>유형:</strong> ${analysis.smishing_type}<br>
                    <strong>이유:</strong>
                    <div class="reason-box">${escapeHtml(analysis.reason)}</div>
                    <br>
                    ${officialUrlHtml}
                        
                </div>

                <!-- <div style="margin-top:10px; display:flex; gap:8px;">
                     <button id="copyJsonBtn">분석 결과 복사</button>
                    </div> -->
            </div>
        `;

        const copyBtn = document.getElementById('copyJsonBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                const text = JSON.stringify({input: {text: messageText, sender_number: senderNumber}, analysis: analysis}, null, 2);
                copyToClipboard(text).then(() => {
                    copyBtn.textContent = '복사됨';
                    setTimeout(() => (copyBtn.textContent = '분석 결과 복사'), 1500);
                });
            });
        }
    }

    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }

    // function copyToClipboard(text) {
    //     if (navigator.clipboard && navigator.clipboard.writeText) {
    //         return navigator.clipboard.writeText(text);
    //     }
    //     return new Promise((resolve, reject) => {
    //         const ta = document.createElement('textarea');
    //         ta.value = text;
    //         document.body.appendChild(ta);
    //         ta.select();
    //         try {
    //             document.execCommand('copy');
    //             resolve();
    //         } catch (e) {
    //             reject(e);
    //         } finally {
    //             document.body.removeChild(ta);
    //         }
    //     });
    // }

    document.addEventListener('DOMContentLoaded', function () {
        const analyzeBtn = document.getElementById('analyzeButton');
        const inputText = document.getElementById('inputText');
        const inputPhone = document.getElementById('inputPhone');


        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', async () => {
            const text = inputText.value && inputText.value.trim();
            const senderNumber = inputPhone.value && inputPhone.value.trim();

            if (!text) {
                alert('분석할 문자를 입력하세요.');
                return;
            }

            // 분석 시작을 알리는 메시지
            document.getElementById('analysisCard').innerHTML = '<p>분석 중입니다...</p>';

            const requestBody = { text: text };
            if (senderNumber) {
                requestBody.sender_number = senderNumber;
            }

            try {
                const response = await fetch('http://localhost:8000/analyze-message', {
                    method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody)
                    });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const analysisResult = await response.json();
                    renderAnalysis(analysisResult, text, senderNumber);

            } catch (error) {
                console.error('분석 중 오류 발생:', error);
                const container = document.getElementById('analysisCard');
                if (container) {
                    container.innerHTML = `<p style="color:red;">분석 서버에 연결할 수 없습니다. 또는 서버 응답에 문제가 있습니다. (${error.message})</p>`;
                }
            }
        });
    }
});

})();