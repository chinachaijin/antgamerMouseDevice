module.exports = {
  packagerConfig: {
    // 【关键】指向不含扩展名的图标路径
    // Forge 会自动根据平台寻找 .icns (macOS), .ico (Windows), .png (Linux)
    icon: './build/icon', 
  }
}