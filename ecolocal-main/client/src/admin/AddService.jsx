import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addService, getServiceById, updateService } from "../services/serviceService";
import { uploadImage } from "../services/uploadService.jsx";

const AddService = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Detect if we are in Edit mode
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    basePrice: 0,
    category: "",
    providerName: "",
    estimatedTime: "",
    availabilityStatus: "available",
    mainImage: "",
    galleryImages: [],
    slots: 0
  });

  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // 🔄 Fetch logic for Edit mode
  useEffect(() => {
    if (id) {
      const fetchServiceData = async () => {
        try {
          setFetchLoading(true);
          const response = await getServiceById(id);
          const data = response.service; // Extract the nested service object

          if (data) {
            setFormData({
              serviceName: data.serviceName || "",
              description: data.description || "",
              basePrice: data.basePrice || 0,
              category: data.category || "",
              providerName: data.providerName || "",
              estimatedTime: data.estimatedTime || "",
              availabilityStatus: data.availabilityStatus || "available",
              mainImage: data.mainImage || "",
              galleryImages: data.galleryImages || [],
              slots: data.slots || 0
            });
          }
        } catch (error) {
          console.error("FETCH ERROR:", error);
          alert("Error loading service data ❌");
        } finally {
          setFetchLoading(false);
        }
      };
      fetchServiceData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "basePrice" || name === "slots" ? Number(value) : value,
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setGalleryUploading(true);
    try {
      const uploadPromises = files.map(file => {
        const data = new FormData();
        data.append("image", file);
        return uploadImage(data, token);
      });

      const urlPaths = await Promise.all(uploadPromises);
      const updatedGallery = [...formData.galleryImages, ...urlPaths];
      
      // Auto set mainImage if none exists
      let mainImg = formData.mainImage;
      if (!mainImg && urlPaths.length > 0) mainImg = urlPaths[0];

      setFormData({ ...formData, galleryImages: updatedGallery, mainImage: mainImg });
    } catch (error) {
      console.error(error);
      alert("Error uploading images ❌");
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeImage = (imgIndex) => {
    const removedImg = formData.galleryImages[imgIndex];
    const updatedGallery = formData.galleryImages.filter((_, i) => i !== imgIndex);
    
    // If we removed the mainImage, pick another one or clear it
    let mainImg = formData.mainImage;
    if (mainImg === removedImg) {
      mainImg = updatedGallery[0] || "";
    }

    setFormData({ ...formData, galleryImages: updatedGallery, mainImage: mainImg });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mainImage) {
      alert("Please upload at least one image and set it as main! 🖼️");
      return;
    }

    const payload = {
      serviceName: formData.serviceName,
      description: formData.description,
      basePrice: Number(formData.basePrice),
      category: formData.category.toLowerCase(),
      providerName: formData.providerName,
      estimatedTime: formData.estimatedTime,
      availabilityStatus: formData.availabilityStatus.toLowerCase(),
      mainImage: formData.mainImage,
      galleryImages: formData.galleryImages,
      slots: Number(formData.slots)
    };

    try {
      setUploading(true);
      if (id) {
        await updateService(id, payload, token);
        alert("Service updated successfully ✅");
      } else {
        await addService(payload, token);
        alert("Service added successfully ✅");
      }
      navigate("/admin/services");
    } catch (error) {
      console.error("SERVICE SUBMIT ERROR:", error.response?.data || error);
      const serverMsg = error.response?.data?.message || `Error ${id ? "updating" : "adding"} service ❌`;
      alert(serverMsg);
    } finally {
      setUploading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontFamily: "Outfit, sans-serif" }}>
        <h2 style={{ color: "var(--shop-primary)" }}>Loading service data...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto", fontFamily: "Outfit, sans-serif" }}>
      <h2 style={{ color: "var(--shop-primary)", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        {id ? "Edit Service" : "Add Service"} (Premium Structure)
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Core Info */}
        <section style={styles.sectionCard}>
          <h3>Basic Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Service Name</label>
              <input type="text" name="serviceName" value={formData.serviceName} onChange={handleChange} required style={styles.input} placeholder="e.g. Home Cleaning Pro" />
            </div>
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Base Price (₹)</label>
              <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} required style={styles.input} placeholder="0" />
            </div>
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required style={styles.input}>
                <option value="">Select Category</option>
                {[
                  { val: "repair", label: "Repair" },
                  { val: "cleaning", label: "Cleaning" },
                  { val: "delivery", label: "Delivery" },
                  { val: "consulting", label: "Consulting" },
                  { val: "local-help", label: "Local Help" }
                ].map(c => (
                  <option key={c.val} value={c.val}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Provider Name</label>
              <input type="text" name="providerName" value={formData.providerName} onChange={handleChange} required style={styles.input} placeholder="e.g. EcoClean Co." />
            </div>
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Estimated Time</label>
              <input type="text" name="estimatedTime" value={formData.estimatedTime} onChange={handleChange} style={styles.input} placeholder="e.g. 2-3 Hours" />
            </div>
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Available Slots / Capacity</label>
              <input type="number" name="slots" value={formData.slots} onChange={handleChange} style={styles.input} placeholder="0" />
            </div>
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Availability Status</label>
              <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleChange} style={styles.input}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "15px" }}>
            <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required style={{ ...styles.input, height: "100px" }} placeholder="Describe the service in detail..." />
          </div>
        </section>

        {/* Media Block - Mirroring AddProduct's Gallery Style */}
        <section style={styles.colorBlock}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: 0 }}>Gallery & Media</h3>
            {galleryUploading && <span style={{ color: "var(--shop-primary)", fontSize: "0.9rem" }}>Uploading...</span>}
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Service Images (Front, Working, Tools, etc.)</label>
            <input 
              type="file" 
              multiple 
              onChange={handleImageUpload} 
              disabled={galleryUploading}
            />
            
            <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
              {formData.galleryImages.map((img, i) => (
                <div key={i} style={{ ...styles.imgWrap, border: formData.mainImage === img ? "3px solid var(--shop-primary)" : "1px solid #ddd" }}>
                  <img src={`http://localhost:5000${img}`} alt="Gallery Preview" style={styles.imgPreview} />
                  <div style={styles.imgActions}>
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, mainImage: img })}
                      style={{ ...styles.imgActionBtn, background: formData.mainImage === img ? "var(--shop-primary)" : "#666" }}
                    >
                      {formData.mainImage === img ? "★ Main" : "Set Main"}
                    </button>
                    <button type="button" onClick={() => removeImage(i)} style={{ ...styles.imgActionBtn, background: "#ff4444" }}>X</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <button type="submit" style={styles.submitBtn} disabled={uploading}>
          {id ? (uploading ? "Updating Service..." : "Update Service ✅") : (uploading ? "Creating Service..." : "Create Service ✅")}
        </button>
      </form>
    </div>
  );
};

const styles = {
  sectionCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  colorBlock: { background: "#fcfcfc", border: "1px solid #eee", padding: "20px", borderRadius: "12px", marginBottom: "25px" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "5px", boxSizing: "border-box" },
  imgWrap: { position: "relative", width: "120px", height: "120px", borderRadius: "10px", overflow: "hidden" },
  imgPreview: { width: "100%", height: "100%", objectFit: "cover" },
  imgActions: { position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", background: "rgba(0,0,0,0.6)" },
  imgActionBtn: { flex: 1, border: "none", color: "white", padding: "4px 0", fontSize: "0.7rem", cursor: "pointer" },
  submitBtn: { background: "var(--shop-primary)", color: "white", padding: "18px", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "700", cursor: "pointer", marginTop: "10px", boxShadow: "0 4px 12px rgba(61, 120, 69, 0.2)" }
};

export default AddService;
