// import PropTypes from 'prop-types'; // Thư viện giúp kiểm tra kiểu dữ liệu của props

function Navigation({ items, activeTab, onTabChange }) {
  return (
    <nav>
      {items.map((item) => (
        <button
          key={item.id}
          // Thêm class 'active' nếu id của item này trùng với activeTab
          className={activeTab === item.id ? 'active' : ''}
          // Khi click, gọi hàm onTabChange và truyền id của item này lên
          onClick={() => onTabChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

// Định nghĩa kiểu dữ liệu cho props để code an toàn hơn
// Bạn cần cài đặt thư viện này: npm install prop-types
// Navigation.propTypes = {
//   items: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.string.isRequired,
//       label: PropTypes.string.isRequired,
//     })
//   ).isRequired,
//   activeTab: PropTypes.string.isRequired,
//   onTabChange: PropTypes.func.isRequired,
// };

export default Navigation;