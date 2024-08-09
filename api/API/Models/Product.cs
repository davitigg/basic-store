using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models
{
    public enum Category
    {
        Accessories, Electronics, Clothing, Fitness, Other
    }

    [Table("Products")]
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public double Price { get; set; }
        public int Quantity { get; set; }
        public string? Category { get; set; }
        [ForeignKey("Seller")]
        private int SellerId { get; set; }
        public User? Seller { get; set; }

        public Product(string name, string description, double price, int quantity, string category)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Description = description;
            if (price > 0)
            {
                Price = price;
            }
            else throw new ArgumentOutOfRangeException(nameof(price));
            if (quantity >= 0)
            {
                Quantity = quantity;
            }
            else throw new ArgumentOutOfRangeException(nameof(quantity));
            if (category != null && Enum.IsDefined(typeof(Category), category))
            {
                Category = category;
            }
            else Category = null;
        }
    }
}
