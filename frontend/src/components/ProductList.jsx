import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import HeroSection from "./HeroSection";

import { useSearch } from "../context/SearchContext";

import { useCart } from "../context/CartContext";

function ProductList() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const { searchQuery } = useSearch();

  const { addToCart } = useCart();

  useEffect(() => {
    fetch("http://localhost:8000/api/products/")
      .then((res) => res.json())

      .then((data) => {
        // ... (ส่วน Logic การเปลี่ยนรูปสินค้าและสีพื้นหลัง คงเดิม) ...

        let modifiedProducts = [...data.products];

        if (modifiedProducts.length > 1) {
          modifiedProducts[1] = {
            ...modifiedProducts[1],

            id: 999,

            title: "Classic Wooden Dining Chair",

            category: "furniture",

            price: 129,

            rating: 4.5,

            stock: 10,

            brand: "WoodCraft",

            description:
              "เก้าอี้ไม้ดีไซน์คลาสสิก แข็งแรงทนทาน เหมาะสำหรับโต๊ะอาหาร",

            thumbnail:
              "https://www.pngarts.com/files/3/Wooden-Chair-PNG-Image-Background.png", // รูปเก้าอี้ไม้
          };
        }

        modifiedProducts = modifiedProducts.map((product, index) => {
          if (index === 0) return { ...product, bgColor: "#FEE2E2" };

          if (product.id === 999) return { ...product, bgColor: "#F3EBE0" };

          return { ...product, bgColor: "#FAFAF8" };
        });

        setProducts(modifiedProducts);

        setLoading(false);
      })

      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();

    if (id === 999) {
      setProducts(products.filter((p) => p.id !== id));

      return;
    }

    if (confirm("ยืนยันการลบสินค้า?")) {
      try {
        await fetch(`http://localhost:8000/api/products/${id}/`, {
          method: "DELETE",
        });

        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  // ✅ จุดสำคัญที่ต้องแก้: ประกาศตัวแปรนี้ไว้นอก useEffect และก่อน return เพื่อให้ JSX มองเห็น

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center text-primary font-bold text-xl">
        Loading...
      </div>
    );

  return (
    <>
      <HeroSection />

      <div id="shop-section" className="w-full py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Header & Filter */}

          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-textMain mb-2 flex items-center gap-2">
                สินค้าแนะนำ <span className="text-2xl">🔥</span>
              </h2>

              <div className="w-12 h-1 bg-secondary rounded-full"></div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                    selectedCategory === cat
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-textMuted border-transparent hover:bg-white hover:text-primary hover:shadow-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* --- Product List --- */}

          <div className="space-y-10">
            {/* ✅ เรียกใช้ filteredProducts ได้แล้ว เพราะประกาศไว้ด้านบนแล้ว */}

            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-[3rem] p-5 shadow-soft hover:shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center border border-white/50"
              >
                {/* Image Section (ใช้ bgColor จากที่เรากำหนด) */}

                <div
                  className="w-full md:w-80 h-72 rounded-[2.5rem] flex-shrink-0 relative overflow-hidden transition-colors flex items-center justify-center"
                  style={{ backgroundColor: product.bgColor || "#FAFAF8" }}
                >
                  <span className="absolute top-6 left-6 bg-white text-gray-800 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider z-10 shadow-sm border border-gray-100">
                    {product.category}
                  </span>

                  <Link
                    to={`/product/${product.id}`}
                    className="block w-full h-full p-8 flex items-center justify-center"
                  >
                    <img
                      src={
                        product.thumbnail ||
                        "https://placehold.co/600x600/305949/ffffff?text=Product"
                      }
                      alt={product.title}
                      className="max-w-full max-h-full object-contain transition duration-700 group-hover:scale-110 drop-shadow-xl"
                    />
                  </Link>
                </div>

                {/* Details Section */}

                <div className="flex-1 w-full text-center md:text-left flex flex-col justify-center py-2 pr-4 md:pr-8">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-2">
                      {product.brand || "GENERIC BRAND"}
                    </p>

                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="text-3xl md:text-4xl font-bold text-textMain hover:text-primary transition duration-300 leading-tight uppercase">
                        {product.title}
                      </h3>
                    </Link>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2 md:line-clamp-3 font-light">
                    {product.description ||
                      "รายละเอียดสินค้าคุณภาพดี คัดสรรมาเพื่อคุณโดยเฉพาะ เหมาะสำหรับการใช้งานในทุกรูปแบบ..."}
                  </p>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-auto">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold text-primary">
                        ${product.price}
                      </span>

                      {product.stock > 0 ? (
                        <span className="text-xs text-secondary bg-secondary/10 px-3 py-1 rounded-md font-bold">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-xs text-danger bg-red-100 px-3 py-1 rounded-md font-bold">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="flex-1 md:flex-none btn-primary px-8 py-3 text-sm"
                      >
                        Add to Cart
                      </button>

                      <Link
                        to={`/product/edit/${product.id}`}
                        className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition shadow-sm"
                      >
                        ✎
                      </Link>

                      <button
                        onClick={(e) => handleDelete(product.id, e)}
                        className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-danger transition shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-24 text-gray-400 border border-dashed border-gray-200 rounded-[3rem]">
              <p className="text-xl font-light">ไม่พบสินค้าที่คุณค้นหา</p>

              <button
                onClick={() => setSelectedCategory("All")}
                className="text-secondary mt-3 underline font-bold hover:text-primary transition"
              >
                ดูสินค้าทั้งหมด
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductList;
