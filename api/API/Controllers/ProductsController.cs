using API.Database;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly TokenService tokenService = new();


        public ProductsController(DataContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [HttpGet, Authorize]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            var products = await _context.Products
                .Include(i => i.Seller)
                .ToListAsync();

            if (products.IsNullOrEmpty())
            {
                return NotFound();
            }
            products.ForEach(p => p.Seller!.Password = "");
            return products;

        }

        // GET: api/Products/seller/5
        [HttpGet("seller/{id}"), Authorize(Roles = "Seller,Admin")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProduct(int id)
        {
            // get userId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var userId = Int32.Parse(tokenService.GetData(jwtToken, "id"));
            if (userId != id && _context.Users.FindAsync(userId).Result!.Role != UserRole.Admin)
            {
                return Unauthorized();
            }

            var products = await _context.Products
                .Where(p => p.Seller!.Id == id)
                .Include(i => i.Seller)
                .ToListAsync();

            if (products.IsNullOrEmpty())
            {
                return NotFound();
            }

            products.ForEach(p => p.Seller!.Password = "");
            return products;
        }

        // PUT: api/Products/Seller/5/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("seller/{sellerId}/{id}"), Authorize(Roles = "Seller,Admin")]
        public async Task<IActionResult> PutProduct(int id, int sellerId, Product reqProduct)
        {
            // get userId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var jwtId = Int32.Parse(tokenService.GetData(jwtToken, "id"));

            if (id != reqProduct.Id)
            {
                return BadRequest();
            }

            if (jwtId != sellerId && _context.Users.FindAsync(jwtId).Result!.Role != UserRole.Admin)
            {
                return Unauthorized();
            }

            var product = await _context.Products
                .Where(p => p.Id == reqProduct.Id)
                .Include(p => p.Seller)
                .FirstOrDefaultAsync();

            if (sellerId != product!.Seller!.Id)
            {
                return Conflict();
            }

            product.Name = reqProduct.Name;
            product.Description = reqProduct.Description;
            product.Price = reqProduct.Price;
            product.Quantity = reqProduct.Quantity;
            product.Category = reqProduct.Category;

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }

        // POST: api/Products
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost, Authorize(Roles = "Seller,Admin")]
        public async Task<ActionResult<Product>> PostProduct(int sellerId, Product product)
        {
            // get sellerId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var jwtId = Int32.Parse(tokenService.GetData(jwtToken, "id"));

            if (jwtId != sellerId && _context.Users.FindAsync(jwtId).Result!.Role != UserRole.Admin)
            {
                return Unauthorized();
            }

            var seller = await _context.Users.Where(u => u.Id == sellerId).FirstOrDefaultAsync();
            if (seller == null)
            {
                return Conflict();
            }


            product.Seller = seller;
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();

            product.Seller.Password = "";
            return CreatedAtAction("GetProduct", new { id = product.Id }, product);
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}"), Authorize(Roles = "Seller,Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            // get userId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var jwtId = Int32.Parse(tokenService.GetData(jwtToken, "id"));

            var product = await _context.Products
                .Where(p => p.Id == id)
                .Include(p => p.Seller)
                .FirstOrDefaultAsync();

            if (jwtId != product!.Seller!.Id && _context.Users.FindAsync(jwtId).Result!.Role != UserRole.Admin)
            {
                return Unauthorized();
            }

            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/Products
        [HttpDelete, Authorize(Roles = "Seller,Admin")]
        public async Task<IActionResult> DeleteProducts(int[] ids)
        {
            // get userId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var jwtId = Int32.Parse(tokenService.GetData(jwtToken, "id"));

            var products = await _context.Products
                .Where(p => ids.Contains(p.Id))
                .Include(p => p.Seller)
                .ToListAsync();

            if (products.IsNullOrEmpty())
            {
                return NotFound();
            }

            foreach (var p in products)
            {
                if (jwtId != p.Seller!.Id && _context.Users.FindAsync(jwtId).Result!.Role != UserRole.Admin)
                {
                    return Unauthorized();
                }
                _context.Products.Remove(p);
            }

            await _context.SaveChangesAsync();

            return Ok();
        }
        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}
