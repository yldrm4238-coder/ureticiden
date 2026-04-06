import { Link } from "react-router-dom";
import { MapPin, BadgeCheck, Leaf } from "lucide-react";
import { Product, priceTypeLabels } from "@/lib/data";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const renderPrice = () => {
    if (product.price) {
      return (
        <span className="font-bold text-foreground">
          ₺{product.price.toLocaleString("tr-TR")}
          <span className="text-sm font-normal text-muted-foreground">
            /{product.priceType === "ton" ? "ton" : "kg"}
          </span>
        </span>
      );
    }
    return (
      <span className="font-semibold text-accent">
        {priceTypeLabels[product.priceType]}
      </span>
    );
  };

  return (
    <Link to={`/urun/${product.id}`} className="group block">
      <div className="card-hover rounded-2xl overflow-hidden bg-card border border-border">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {product.isOrganic && (
              <span className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                <Leaf className="w-3 h-3" />
                Organik
              </span>
            )}
            {product.isVerified && (
              <span className="flex items-center gap-1 bg-card/90 backdrop-blur text-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                <BadgeCheck className="w-3 h-3 text-primary" />
                Onaylı
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {product.category}
          </p>
          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {product.city}, {product.district}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {renderPrice()}
            <span className="text-xs text-muted-foreground">
              Min: {product.minOrder}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
