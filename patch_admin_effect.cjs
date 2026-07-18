const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /return \(\) => unsubscribe\(\);\n  \}, \[\]\);/,
  `return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Fallback to static data for now if empty
        const mockProducts = PRODUCTS_DATA.map(p => ({
          ...p,
          status: "Published",
          priceInr: p.price * 83,
          updatedAt: new Date(p.releaseDate || Date.now())
        }));
        setProducts(mockProducts);
        setProductsLoading(false);
      } else {
        const productsData: any[] = [];
        snapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsData);
        setProductsLoading(false);
      }
    }, (error) => {
      console.error("Error fetching products:", error);
      const mockProducts = PRODUCTS_DATA.map(p => ({
        ...p,
        status: "Published",
        priceInr: p.price * 83,
        updatedAt: new Date(p.releaseDate || Date.now())
      }));
      setProducts(mockProducts);
      setProductsLoading(false);
    });
    return () => unsubscribe();
  }, []);`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
