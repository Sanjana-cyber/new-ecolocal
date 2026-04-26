document.addEventListener('DOMContentLoaded', function() {
    // Initialize Dashboard Charts if on index page
    const dashboardChart = document.getElementById('dashboardChart');
    if (dashboardChart) {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                new Chart(dashboardChart, {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Security Guards Required',
                            data: data.staff_avg,
                            backgroundColor: 'rgba(230, 57, 70, 0.7)',
                            borderColor: '#e63946',
                            borderWidth: 0,
                            borderRadius: 12
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8e94a0' } },
                            x: { grid: { display: false }, ticks: { color: '#8e94a0' } }
                        },
                        plugins: { legend: { labels: { color: '#ffffff', font: { weight: 'bold' } } } }
                    }
                });
            });
    }

    // Initialize Result Charts if on result page
    const resultChart = document.getElementById('resultChart');
    if (resultChart) {
        const staff = resultChart.dataset.staff;
        const crowd = resultChart.dataset.crowd;
        
        new Chart(resultChart, {
            type: 'doughnut',
            data: {
                labels: ['Security Staff', 'Staff Capacity Gap'],
                datasets: [{
                    data: [staff, crowd / 50], 
                    backgroundColor: ['#e63946', '#f8f9fa'],
                    hoverBackgroundColor: ['#c1121f', '#f0f0f0'],
                    borderWidth: 1,
                    borderColor: '#eee'
                }]
            },
            options: {
                cutout: '80%',
                plugins: { legend: { display: false } }
            }
        });
    }
});

