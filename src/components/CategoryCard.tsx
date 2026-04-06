import { Link } from "react-router-dom";
import { Category } from "@/lib/data";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link
      to={`/pazar?kategori=${category.slug}`}
      className="group block"
    >
      <div className="card-hover relative rounded-2xl overflow-hidden aspect-[3/4]">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-lg font-bold text-earth-foreground">{category.name}</h3>
          <p className="text-sm text-earth-foreground/70">{category.count} ürün</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
