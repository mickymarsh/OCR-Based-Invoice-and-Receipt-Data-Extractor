const Footer = ({ variant = 'default' }) => {
  // Different footer style variants
  const styles = {
    default: {
      container: " bottom-0 left-0 right-0 text-center text-xs text-teal-900 bg-gradient-to-r from-blue-100 via-teal-100 to-cyan-100 py-2 border-t border-teal-200 z-10",
      text: "text-teal-900",
      subtext: "mt-1 text-teal-700"
    },
    modern: {
      container: " bottom-0 left-0 right-0 text-center text-xs text-white bg-gradient-to-r from-[#2F86A6] to-[#34BE82] py-3 border-t border-white/20 z-10 shadow-lg",
      text: "font-medium text-sm",
      subtext: "mt-1 text-white/90"
    },
    minimal: {
      container: " bottom-0 left-0 right-0 text-center text-xs text-gray-600 bg-white/80 backdrop-blur-sm py-2 border-t border-gray-200 z-10",
      text: "text-gray-700",
      subtext: "mt-1 text-gray-500"
    }
  };
  
  const style = styles[variant] || styles.default;
  
  return (
    <footer className={style.container}>
      <p className={style.text}>© {new Date().getFullYear()} Smart Invoice and Receipt Scanner. All rights reserved.</p>
      <p className={style.subtext}>Secure authentication powered by Firebase</p>
    </footer>
  );
};

export default Footer;