// 监听选择结果
window.electronAPI.onSelectionList((devices) => {
  console.log('从弹窗收到的数据:', devices);
  if (devices.length === 0) return;

  // 创建自定义模态框 (可以使用 HTML/CSS 或第三方库如 SweetAlert2)
  const deviceNames = devices.map((d, index) => 
    `<option value="${d.deviceId}">${d.name || 'Unknown Device'} (VID:${d.vendorId})</option>`
  ).join('');

  document.getElementById("device-select").innerHTML = deviceNames
  
  // 当用户点击确认时：
  document.getElementById('confirm-btn').onclick = () => {
    const selectedId = document.getElementById('device-select').value;
    window.electronAPI.submitSelection(selectedId); // 发送回主进程
    closeModal();
  };
  document.getElementById('cancel-btn').onclick = () => {
    window.electronAPI.submitSelection(''); // 发送回主进程
    closeModal();
  };
});