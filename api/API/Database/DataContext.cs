using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Database
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<CartProduct> Cart { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasData(
                  new User(
                    id: 1,
                    email: "admin@test",
                    password: "123456",
                    fName: "fnameadmin",
                    lName: "lnameadmin",
                    role: UserRole.Admin),
                new User(
                    id: 2,
                    email: "buyer1@test",
                    password: "123456",
                    fName: "fnamebuyer1",
                    lName: "lnamebuyer1",
                    role: UserRole.Buyer),
                new User(
                    id: 3,
                    email: "buyer2@test",
                    password: "123456",
                    fName: "fnamebuyer2",
                    lName: "lnamebuyer2",
                    role: UserRole.Buyer),
                 new User(
                    id: 4,
                    email: "seller1@test",
                    password: "123456",
                    fName: "fnameseller1",
                    lName: "lnameseller1",
                    role: UserRole.Seller),
                new User(
                    id: 5,
                    email: "seller2@test",
                    password: "123456",
                    fName: "fnameseller2",
                    lName: "lnameseller2",
                    role: UserRole.Seller));
        }

    }
}
