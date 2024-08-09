using API.Database;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Data;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartProductsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly TokenService tokenService = new();

        public CartProductsController(DataContext context)
        {
            _context = context;
        }

        // GET: api/CartProducts/buyer/5
        [HttpGet("buyer/{id}"), Authorize(Roles = "Buyer,Admin")]
        public async Task<ActionResult<IEnumerable<CartProduct>>> GetCartProduct(int id)
        {
            // get userId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var jwtId = Int32.Parse(tokenService.GetData(jwtToken, "id"));
            if (jwtId != id && _context.Users.FindAsync(jwtId).Result!.Role != UserRole.Admin)
            {
                return Unauthorized();
            }

            var cartProducts = await _context.Cart
                .Where(p => p.Buyer!.Id == id)
                .Include(i => i.Buyer)
                .Include(i => i.Product)
                .Include(i => i.Product!.Seller)
                .ToListAsync();


            if (cartProducts.IsNullOrEmpty())
            {
                return NotFound();
            }

            cartProducts.ForEach(p =>
            {
                p.Buyer!.Password = "";
                p.Product!.Seller!.Password = "";
            });
            return cartProducts;
        }

        // PUT: api/CartProducts/buyer/5/5 
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("buyer/{buyerId}/{id}"), Authorize(Roles = "Buyer,Admin")]
        public async Task<ActionResult<CartProduct>> PutCartProduct(int id, int buyerId, int quantity)
        {
            // get userId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var jwtId = Int32.Parse(tokenService.GetData(jwtToken, "id"));

            if (jwtId != buyerId && _context.Users.FindAsync(jwtId).Result!.Role != UserRole.Admin)
            {
                return Unauthorized();
            }

            var cartProduct = await _context.Cart
                .Where(p => p.Id == id)
                .Include(p => p.Buyer)
                .Include(p => p.Product)
                .Include(p => p.Product!.Seller)
                .FirstOrDefaultAsync();

            if (buyerId != cartProduct!.BuyerId)
            {
                return Unauthorized();
            }

            if (quantity <= 0)
            {
                return BadRequest("Illegal argument");
            }

            var product = await _context.Products.FindAsync(cartProduct!.ProductId);

            var step = quantity - cartProduct.Quantity;
            if (product!.Quantity < step)
            {
                return BadRequest("Product quantity is not enough");
            }
            product!.Quantity -= (int)step!;
            cartProduct.Quantity = quantity;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CartProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            cartProduct.Buyer!.Password = "";
            cartProduct.Product!.Seller!.Password = "";
            return CreatedAtAction("GetCartProduct", new { id = cartProduct.Id }, cartProduct);
        }

        // POST: api/CartProducts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost, Authorize(Roles = "Buyer,Admin")]
        public async Task<ActionResult<CartProduct>> PostCartProduct(int buyerId, Product reqProduct)
        {
            var product = await _context.Products
                .Include(p => p.Seller)
                .Where(p => p.Id == reqProduct.Id)
                .FirstOrDefaultAsync();

            if (product!.Quantity == 0)
            {
                return BadRequest("Product Quantity is 0");
            }
            // get buyerId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var jwtId = Int32.Parse(tokenService.GetData(jwtToken, "id"));
            if (jwtId != buyerId && _context.Users.FindAsync(jwtId).Result!.Role != UserRole.Admin)
            {
                return Unauthorized();
            }
            var buyer = await _context.Users.FindAsync(buyerId);

            var cartProduct = await _context.Cart.Where(p => p.ProductId == product.Id && p.BuyerId == buyerId).FirstOrDefaultAsync();
            if (cartProduct == null)
            {
                cartProduct = new CartProduct
                {
                    BuyerId = buyer!.Id,
                    ProductId = product.Id,
                    Quantity = 1
                };
                product.Quantity -= 1;

                await _context.Cart.AddAsync(cartProduct);
                await _context.SaveChangesAsync();

                cartProduct.Buyer!.Password = "";
                cartProduct.Product!.Seller!.Password = "";
                return CreatedAtAction("GetCartProduct", new { id = cartProduct.Id }, cartProduct);
            }
            else
            {
                var newQnty = (int)cartProduct.Quantity! + 1;
                return await PutCartProduct(cartProduct.Id, buyerId, newQnty);
            }
        }

        // DELETE: api/CartProducts/5
        [HttpDelete("{id}"), Authorize(Roles = "Buyer,Admin")]
        public async Task<IActionResult> DeleteCartProduct(int id)
        {
            // get userId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var jwtId = Int32.Parse(tokenService.GetData(jwtToken, "id"));

            var cartProduct = await _context.Cart.FindAsync(id);
            if (cartProduct == null)
            {
                return NotFound();
            }

            if (jwtId != cartProduct.BuyerId && _context.Users.FindAsync(jwtId).Result!.Role != UserRole.Admin)
            {
                return Unauthorized();
            }

            var product = await _context.Products.FindAsync(cartProduct.ProductId);
            product!.Quantity += (int)cartProduct.Quantity!;

            _context.Cart.Remove(cartProduct);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/CartProducts
        [HttpDelete, Authorize(Roles = "Buyer,Admin")]
        public async Task<IActionResult> DeleteCartProducts(int[] ids)
        {
            // get userId from jwt token
            var jwtToken = tokenService.GetToken(Request);
            var jwtId = Int32.Parse(tokenService.GetData(jwtToken, "id"));

            var cartProducts = await _context.Cart.Where(p => ids.Contains(p.Id)).ToListAsync();
            if (cartProducts.IsNullOrEmpty())
            {
                return NotFound();
            }

            foreach (var p in cartProducts)
            {
                if (jwtId != p.BuyerId && _context.Users.FindAsync(jwtId).Result!.Role != UserRole.Admin)
                {
                    return Unauthorized();
                }

                var product = _context.Products.Find(p.ProductId);
                product!.Quantity += (int)p.Quantity!;
                _context.Cart.Remove(p);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
        private bool CartProductExists(int id)
        {
            return _context.Cart.Any(e => e.Id == id);
        }
    }
}
