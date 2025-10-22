import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import './VendorDashboard.css';
// import { useNavigate } from "react-router-dom";

const getAuth = () => {
  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return { token: null, id: null, role: null };
    const parsed = JSON.parse(raw);
    return { token: parsed.token, id: parsed.id, role: parsed.role };
  } catch {
    return { token: null, id: null, role: null };
  }
};

export default function VendorDashboard() {
  const [{ token, role }, setAuth] = useState(getAuth());
  const [activeTab, setActiveTab] = useState("orders");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name:"", price:"", description:"", category:"", subcategory:"", stock:"", 
    image:"", brand:"", color:"", sizes:""
  });

  useEffect(() => setAuth(getAuth()), []);

  const loadProducts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(Array.isArray(res.data) ? res.data : (res.data.products || []));
    } catch (err) {
      console.error("Failed to fetch products:", err.response?.data || err.message);
    }
  }, [token]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(Array.isArray(res.data) ? res.data : (res.data.orders || []));
    } catch (err) {
      console.error("Failed to fetch orders:", err.response?.data || err.message);
    }
  }, [token]);

  const updateOrderStatus = async (orderId, status) => {
    if (!token) return;
    try {
      await axios.put(`http://localhost:5000/orders/${orderId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadOrders();
    } catch (err) {
      console.error("Failed to update order:", err.response?.data || err.message);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    if (!token || role !== "admin") return;
    setLoading(true);
    Promise.all([loadProducts(), loadOrders()])
      .finally(() => setLoading(false));
  }, [token, role, loadProducts, loadOrders]);

  if (!token || role !== "admin") return <div style={{ padding: 24 }}>Admin login required.</div>;

  const username = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("currentUser") || '{}');
      return parsed?.username || 'Admin';
    } catch { return 'Admin'; }
  })();

  const fmtCurrency = n => `₹${(Number(n) || 0).toLocaleString("en-IN")}`;
  const calcTotal = o => {
    if (typeof o.totalAmount === "number") return o.totalAmount;
    return (o.items || []).reduce((sum, it) => sum + (Number(it.price) || Number(it.productId?.price) || 0) * (Number(it.quantity) || 1), 0);
  };

  return (
    <div className="vendor-dashboard">
      <header className="vendor-header">
        <div>{username}</div>
        <button onClick={() => { localStorage.removeItem('currentUser'); window.location.href='/login'; }}>Logout</button>
      </header>

      <div className="vendor-container">
        <aside className="vendor-sidebar">
          <button className={activeTab==="orders"?"active":""} onClick={()=>setActiveTab("orders")}>Orders</button>
          <button className={activeTab==="products"?"active":""} onClick={()=>setActiveTab("products")}>Products</button>
          <button className="refresh" onClick={refreshAll} disabled={loading}>{loading?"Refreshing...":"Refresh"}</button>
        </aside>

        <main className="vendor-main">
          {activeTab==="orders" && (
            <OrdersTab
              orders={orders} fmtCurrency={fmtCurrency} calcTotal={calcTotal}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              search={search} setSearch={setSearch} dateFilter={dateFilter}
              setDateFilter={setDateFilter} sortDir={sortDir} setSortDir={setSortDir}
              updateOrderStatus={updateOrderStatus} loadOrders={loadOrders}
            />
          )}
          {activeTab==="products" && (
            <ProductsTab
              products={products} loadProducts={loadProducts}
              showProductForm={showProductForm} setShowProductForm={setShowProductForm}
              productForm={productForm} setProductForm={setProductForm}
              editingProductId={editingProductId} setEditingProductId={setEditingProductId}
              token={token}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// --- OrdersTab ---
function OrdersTab({ orders, fmtCurrency, calcTotal, statusFilter, setStatusFilter, search, setSearch, dateFilter, setDateFilter, sortDir, setSortDir, updateOrderStatus, loadOrders }) {
  const normalizeStatus = s => String(s || '').toLowerCase();
  const bySearch = o => {
    const shortId = String(o._id).slice(-8).toLowerCase();
    const customer = (o.userId?.name || '').toLowerCase();
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return shortId.includes(term) || customer.includes(term);
  };
  const byDate = o => {
    if (!dateFilter) return true;
    const d = new Date(o.createdAt);
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return iso === dateFilter;
  };

  const searched = orders.filter(o => bySearch(o) && byDate(o));
  const statusCounts = searched.reduce((acc,o) => {
    const s = normalizeStatus(o.orderStatus||o.status||'placed');
    acc[s] = (acc[s]||0)+1;
    acc.all = (acc.all||0)+1;
    return acc;
  }, {all:0});
  const statusOk = o => statusFilter==='all'?true:normalizeStatus(o.orderStatus||o.status)===statusFilter;
  const filtered = searched.filter(statusOk).sort((a,b)=>sortDir==='asc'?new Date(a.createdAt)-new Date(b.createdAt):new Date(b.createdAt)-new Date(a.createdAt));
  const statuses = ['placed','processing','shipped','delivered','cancelled'];

  return (
    <div className="orders-tab">
      <div className="header">
        <h2>My Orders</h2>
        <div className="filters">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search order ID or customer name" style={{width:260}}/>
          <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}/>
          <select value={sortDir} onChange={e=>setSortDir(e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <button onClick={loadOrders}>Refresh</button>
        </div>
      </div>

      <div className="status-filters">
        {['all','placed','processing','shipped','delivered','cancelled'].map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)} className={statusFilter===s?"active":""}>
            {s.charAt(0).toUpperCase()+s.slice(1)} ({statusCounts[s]||0})
          </button>
        ))}
      </div>

      <div style={{overflow:'auto', border:'1px solid #e5e7eb', borderRadius:4, background:'#fff'}}>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && <tr><td colSpan={5} style={{padding:24, color:'#6b7280'}}>No orders found.</td></tr>}
            {filtered.map(o=>(
              <tr key={o._id}>
                <td>{String(o._id).slice(-8).toUpperCase()}</td>
                <td>{o.userId?.username||'-'}</td>
                <td>
                  <div>
                    {(o.items||[]).map(it=>(
                      <div key={it._id || `${o._id}-${it.productId?._id||''}`} style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                        <img src={it.productId?.image||'https://via.placeholder.com/48'} alt={it.productId?.name||it.name} style={{width:30,height:30,borderRadius:4,objectFit:'cover'}}/>
                        <div>{it.productId?.name||it.name}</div>
                      </div>
                    ))}
                  </div>
                </td>
                <td>
                  <select value={String(o.orderStatus||o.status||'placed').toLowerCase()} onChange={e=>updateOrderStatus(o._id,e.target.value)}>
                    {statuses.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </td>
                <td>{fmtCurrency(calcTotal(o))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- ProductsTab ---
function ProductsTab({ products, loadProducts, showProductForm, setShowProductForm, productForm,
   setProductForm, editingProductId, setEditingProductId, token }) {
  const handleSave = async () => {
    if (!token) return;
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      // ✅ Convert comma-separated string into array of { size }
      sizes: (productForm.sizes || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => ({ size: s }))
    };
    try {
      if (editingProductId) {
        await axios.put(`http://localhost:5000/products/${editingProductId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowProductForm(false);
      await loadProducts();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
    }
  };

  const handleDelete = async id => {
    if (!token) return;
    try {
      await axios.delete(`http://localhost:5000/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadProducts();
    } catch(err){ 
      console.error("Delete failed:", err.response?.data || err.message); 
    }
  };

  return (
    <div className="products-tab">
      <div className="header">
        <h2>My Products</h2>
        <div>
          <button
            className="primary"
            onClick={() => {
              setEditingProductId(null);
              setProductForm({ name:'', price:'', description:'', category:'', subcategory:'', stock:'', image:'', brand:'', color:'', sizes:'' });
              setShowProductForm(true);
            }}
          >
            + Add Product
          </button>
          <button className="secondary" onClick={loadProducts}>Refresh</button>
        </div>
      </div>

      {showProductForm && (
        <div className="product-form">
          <div className="grid">
            {['name','price','category','subcategory','stock','image','brand','color','sizes'].map(f=>(
              <div key={f}>
                <label>{f.charAt(0).toUpperCase()+f.slice(1)}</label>
                <input
                  type={(f==='price'||f==='stock')?'number':'text'}
                  value={productForm[f]||''}
                  onChange={e=>setProductForm(prev=>({...prev,[f]:e.target.value}))}
                  placeholder={f==='sizes' ? "Comma separated e.g. S,M,L" : ""}
                />
              </div>
            ))}
            <div style={{gridColumn:'span 2'}}>
              <label>Description</label>
              <textarea
                rows={3}
                value={productForm.description}
                onChange={e=>setProductForm(prev=>({...prev, description:e.target.value}))}
              />
            </div>
          </div>
          <div className="actions">
            <button onClick={handleSave} className="primary">{editingProductId?'Update':'Create'}</button>
            <button onClick={()=>setShowProductForm(false)} className="secondary">Cancel</button>
          </div>
        </div>
      )}

      <div style={{overflow:'auto', border:'1px solid #e5e7eb', borderRadius:4, background:'#fff'}}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length===0 && <tr><td colSpan={4} style={{padding:24,color:'#6b7280'}}>No products found.</td></tr>}
            {products.map(p=>(
              <tr key={p._id}>
                <td style={{display:'flex', alignItems:'center', gap:8}}>
                  <img src={p.image||'https://via.placeholder.com/48'} alt={p.name} style={{width:40,height:40,borderRadius:4,objectFit:'cover'}}/>
                  {p.name}
                </td>
                <td>{`₹${Number(p.price||0).toLocaleString('en-IN')}`}</td>
                <td>{p.stock}</td>
                <td className="actions">
                  <button
                    className="edit"
                    onClick={()=>{
                      setEditingProductId(p._id);
                      setProductForm({
                        name: p.name,
                        price: p.price,
                        description: p.description,
                        category: p.category,
                        subcategory: p.subcategory,
                        stock: p.stock,
                        image: p.image,
                        brand: p.brand || "",
                        color: p.color || "",
                        // ✅ convert sizes array to comma string for editing
                        sizes: (p.sizes || []).map(s => s.size).join(",")
                      });
                      setShowProductForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="delete" onClick={()=>handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
