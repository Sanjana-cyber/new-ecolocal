import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../services/productService";
import { uploadImage } from "../services/uploadService.jsx";

const BACKEND_URL = 'http://localhost:5000';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `${BACKEND_URL}${img}`;
  return `${BACKEND_URL}/uploads/${img}`;
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    mainImage: "",
    colorVariants: []
  });

  const [uploading, setUploading] = useState(false);
  const [colorUploading, setColorUploading] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        
        // Data Normalization for Migration
        let normalizedColors = data.colorVariants || [];
        
        // If it's an old product with flat variants, try to group them
        if (normalizedColors.length === 0 && data.variants?.length > 0) {
          const grouped = data.variants.reduce((acc, v) => {
            const found = acc.find(c => c.color === v.color);
            if (found) {
              found.sizes.push({ size: v.size, stock: v.stock });
              if (v.image && !found.images.includes(v.image)) found.images.push(v.image);
            } else {
              acc.push({
                color: v.color,
                images: v.image ? [v.image] : (data.images || []),
                sizes: [{ size: v.size, stock: v.stock }]
              });
            }
            return acc;
          }, []);
          normalizedColors = grouped;
        }

        setFormData({
          ...data,
          colorVariants: normalizedColors,
          mainImage: data.mainImage || data.images?.[0] || (normalizedColors[0]?.images[0]) || ""
        });
      } catch (error) {
        console.error("Error fetching product", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? Number(value) : value,
    });
  };

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
      if (!formData.mainImage && urlPaths.length > 0) {
        setFormData(prev => ({ ...prev, colorVariants: updated, mainImage: urlPaths[0] }));
      } else {
        setFormData({ ...formData, colorVariants: updated });
      }
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
    
    let mainImg = formData.mainImage;
    if (mainImg === removedImg) {
      mainImg = updated[0]?.images[0] || "";
    }

    setFormData({ ...formData, colorVariants: updated, mainImage: mainImg });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      await updateProduct(id, formData, token);
      alert("Product updated successfully ✅");
      navigate("/admin/products");
    } catch (error) {
      console.error("Update failed", error);
      alert("Error updating product ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto", fontFamily: "Outfit, sans-serif" }}>
      <h2 style={{ color: "var(--shop-primary)", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>Edit Product</h2>

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
              <label>Price (₹)</label>
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
                    value={cv.color} 
                    onChange={(e) => handleColorNameChange(cIndex, e.target.value)} 
                    required 
                    style={styles.input} 
                  />
                </div>
                <button type="button" onClick={() => removeColorVariant(cIndex)} style={styles.removeTextBtn}>Remove Color</button>
              </div>

              {/* Multi-Image Upload */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Gallery Images</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => handleColorImageUpload(cIndex, e)} 
                  disabled={colorUploading === cIndex} 
                />
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
                          {formData.mainImage === img ? "Main" : "Set Main"}
                        </button>
                        <button type="button" onClick={() => removeColorImage(cIndex, iIndex)} style={{ ...styles.imgActionBtn, background: "#ff4444" }}>X</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes section */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontWeight: "600" }}>Sizes & Stock</label>
                  <button type="button" onClick={() => addSize(cIndex)} style={styles.miniAddBtn}>+ Add Size</button>
                </div>
                {cv.sizes.map((s, sIndex) => (
                  <div key={sIndex} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                    <input type="text" name="size" placeholder="Size" value={s.size} onChange={(e) => handleSizeChange(cIndex, sIndex, e)} required style={styles.miniInput} />
                    <input type="number" name="stock" placeholder="Stock" value={s.stock} onChange={(e) => handleSizeChange(cIndex, sIndex, e)} required style={styles.miniInput} />
                    <button type="button" onClick={() => removeSize(cIndex, sIndex)} style={styles.removeTextBtn}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <button type="submit" style={styles.submitBtn} disabled={uploading}>
          {uploading ? "Updating..." : "Update Product ✅"}
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
  submitBtn: { background: "var(--shop-primary)", color: "white", padding: "18px", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "700", cursor: "pointer", marginTop: "10px" }
};

export default EditProduct;
