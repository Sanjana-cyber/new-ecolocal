import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../services/productService";
import { uploadImage } from "../services/uploadService.jsx";

const AddProduct = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    mainImage: "", // Global thumbnail for homepage card
    colorVariants: [
      { color: "", images: [], sizes: [{ size: "", stock: 0 }] }
    ]
  });

  const [uploading, setUploading] = useState(false);
  const [colorUploading, setColorUploading] = useState(null); // index of color currently uploading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? Number(value) : value,
    });
  };

  // Color logic
  const addColorVariant = () => {
    setFormData({
      ...formData,
      colorVariants: [...formData.colorVariants, { color: "", images: [], sizes: [{ size: "", stock: 0 }] }]
    });
  };

  const removeColorVariant = (index) => {
    const updated = formData.colorVariants.filter((_, i) => i !== index);
    setFormData({ ...formData, colorVariants: updated });
  };

  const handleColorNameChange = (index, value) => {
    const updated = [...formData.colorVariants];
    updated[index].color = value;
    setFormData({ ...formData, colorVariants: updated });
  };

  // Size logic
  const addSize = (colorIndex) => {
    const updated = [...formData.colorVariants];
    updated[colorIndex].sizes.push({ size: "", stock: 0 });
    setFormData({ ...formData, colorVariants: updated });
  };

  const removeSize = (colorIndex, sizeIndex) => {
    const updated = [...formData.colorVariants];
    updated[colorIndex].sizes = updated[colorIndex].sizes.filter((_, i) => i !== sizeIndex);
    setFormData({ ...formData, colorVariants: updated });
  };

  const handleSizeChange = (colorIndex, sizeIndex, e) => {
    const updated = [...formData.colorVariants];
    const { name, value } = e.target;
    updated[colorIndex].sizes[sizeIndex][name] = name === "stock" ? Number(value) : value;
    setFormData({ ...formData, colorVariants: updated });
  };

  // Image logic
  const handleColorImageUpload = async (colorIndex, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setColorUploading(colorIndex);
    try {
      const uploadPromises = files.map(file => {
        const data = new FormData();
        data.append("image", file);
        return uploadImage(data, token);
      });

      const urlPaths = await Promise.all(uploadPromises);
      const updated = [...formData.colorVariants];
      updated[colorIndex].images = [...updated[colorIndex].images, ...urlPaths];
      
      // Auto set mainImage if none exists
      let mainImg = formData.mainImage;
      if (!mainImg && urlPaths.length > 0) mainImg = urlPaths[0];

      setFormData({ ...formData, colorVariants: updated, mainImage: mainImg });
    } catch (error) {
      console.error(error);
      alert("Error uploading images ❌");
    } finally {
      setColorUploading(null);
    }
  };

  const removeColorImage = (colorIndex, imgIndex) => {
    const updated = [...formData.colorVariants];
    const removedImg = updated[colorIndex].images[imgIndex];
    updated[colorIndex].images = updated[colorIndex].images.filter((_, i) => i !== imgIndex);
    
    // If we removed the mainImage, pick another one or clear it
    let mainImg = formData.mainImage;
    if (mainImg === removedImg) {
      mainImg = updated[0]?.images[0] || "";
    }

    setFormData({ ...formData, colorVariants: updated, mainImage: mainImg });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Client-side Validation
    if (!formData.mainImage) {
      alert("Please upload at least one image and set it as main! 🖼️");
      return;
    }

    const invalidColor = formData.colorVariants.find(cv => !cv.color || cv.sizes.some(s => !s.size));
    if (invalidColor) {
      alert("Please ensure all colors and sizes have names! ✏️");
      return;
    }

    try {
      setUploading(true);
      // Ensure price is a number
      const payload = {
        ...formData,
        price: Number(formData.price) || 0
      };

      await addProduct(payload, token);
      alert("Product added successfully ✅");
      navigate("/admin/products");
    } catch (error) {
      console.error("ADD PRODUCT ERROR:", error.response?.data || error);
      const serverMsg = error.response?.data?.message || "Error adding product ❌";
      alert(serverMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto", fontFamily: "Outfit, sans-serif" }}>
      <h2 style={{ color: "var(--shop-primary)", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>Add Product (Color-Based Structure)</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Core Info */}
        <section style={styles.sectionCard}>
          <h3>Basic Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label>Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} />
            </div>
            <div>
              <label>Base Display Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required style={styles.input} />
            </div>
            <div>
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required style={styles.input}>
                <option value="">Select Category</option>
                {["farmers", "artisans", "eco", "local-shop"].map(c => (
                  <option key={c} value={c}>{c.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} required style={styles.input} />
            </div>
          </div>
          <div style={{ marginTop: "15px" }}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required style={{ ...styles.input, height: "80px" }} />
          </div>
        </section>

        {/* Color Variants Section */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: 0 }}>Color Variants</h3>
            <button type="button" onClick={addColorVariant} style={styles.addBtn}>+ Add Color Variant</button>
          </div>

          {formData.colorVariants.map((cv, cIndex) => (
            <div key={cIndex} style={styles.colorBlock}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: "600" }}>Color Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Midnight Black" 
                    value={cv.color} 
                    onChange={(e) => handleColorNameChange(cIndex, e.target.value)} 
                    required 
                    style={styles.input} 
                  />
                </div>
                <button type="button" onClick={() => removeColorVariant(cIndex)} style={styles.removeTextBtn}>Remove Color</button>
              </div>

              {/* Multi-Image Upload for this color */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Gallery Images (Front, Side, Back, etc.)</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => handleColorImageUpload(cIndex, e)} 
                  disabled={colorUploading === cIndex} 
                />
                {colorUploading === cIndex && <span style={{ marginLeft: "10px", color: "var(--shop-primary)" }}>Uploading...</span>}
                
                <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                  {cv.images.map((img, iIndex) => (
                    <div key={iIndex} style={{ ...styles.imgWrap, border: formData.mainImage === img ? "3px solid var(--shop-primary)" : "1px solid #ddd" }}>
                      <img src={`http://localhost:5000${img}`} alt="Gallery" style={styles.imgPreview} />
                      <div style={styles.imgActions}>
                        <button 
                          type="button" 
                          onClick={() => setFormData({ ...formData, mainImage: img })}
                          style={{ ...styles.imgActionBtn, background: formData.mainImage === img ? "var(--shop-primary)" : "#666" }}
                        >
                          {formData.mainImage === img ? "★ Main" : "Set Main"}
                        </button>
                        <button type="button" onClick={() => removeColorImage(cIndex, iIndex)} style={{ ...styles.imgActionBtn, background: "#ff4444" }}>X</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes for this color */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontWeight: "600" }}>Sizes & Stock</label>
                  <button type="button" onClick={() => addSize(cIndex)} style={styles.miniAddBtn}>+ Add Size</button>
                </div>
                {cv.sizes.map((s, sIndex) => (
                  <div key={sIndex} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                    <input type="text" name="size" placeholder="Size (e.g. S, M, XL)" value={s.size} onChange={(e) => handleSizeChange(cIndex, sIndex, e)} required style={styles.miniInput} />
                    <input type="number" name="stock" placeholder="Stock" value={s.stock} onChange={(e) => handleSizeChange(cIndex, sIndex, e)} required style={styles.miniInput} />
                    <button type="button" onClick={() => removeSize(cIndex, sIndex)} style={styles.removeTextBtn}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <button type="submit" style={styles.submitBtn} disabled={uploading}>
          {uploading ? "Creating Product..." : "Create Product ✅"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  sectionCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  colorBlock: { background: "#fcfcfc", border: "1px solid #eee", padding: "20px", borderRadius: "12px", marginBottom: "25px" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "5px", boxSizing: "border-box" },
  miniInput: { flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ddd" },
  imgWrap: { position: "relative", width: "120px", height: "120px", borderRadius: "10px", overflow: "hidden" },
  imgPreview: { width: "100%", height: "100%", objectFit: "cover" },
  imgActions: { position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", background: "rgba(0,0,0,0.6)" },
  imgActionBtn: { flex: 1, border: "none", color: "white", padding: "4px 0", fontSize: "0.7rem", cursor: "pointer" },
  addBtn: { background: "var(--shop-primary)", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  miniAddBtn: { background: "#eee", color: "#333", padding: "4px 10px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" },
  removeTextBtn: { background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontSize: "0.85rem" },
  submitBtn: { background: "var(--shop-primary)", color: "white", padding: "18px", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "700", cursor: "pointer", marginTop: "10px", boxShadow: "0 4px 12px rgba(61, 120, 69, 0.2)" }
};

export default AddProduct;
