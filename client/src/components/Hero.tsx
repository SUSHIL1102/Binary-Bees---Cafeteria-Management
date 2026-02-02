export default function Hero() {
  return (
    <section className="hero">
      <nav className="hero-nav">
        <div className="logo">☕ Coffee Shop</div>
        <div className="links">
          <a>Home</a>
          <a>About</a>
          <a>Menu</a>
          <a>Products</a>
          <a>Reviews</a>
          <a>Contact</a>
        </div>
      </nav>

      <div className="hero-content">
        <h1>Fresh Coffee In<br />The Morning</h1>
        <p>
          Start your day with premium roasted coffee,
          crafted for comfort and energy.
        </p>
        <button className="btn btn-primary">Order Now</button>
      </div>
    </section>
  );
}
