using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using IMOMaritimeSingleWindow.Data;
using IMOMaritimeSingleWindow.Models;
using IMOMaritimeSingleWindow.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Policies = IMOMaritimeSingleWindow.Helpers.Constants.Strings.Policies;
using IMOMaritimeSingleWindow.Auth;
using Claims = IMOMaritimeSingleWindow.Helpers.Constants.Strings.Claims;

namespace IMOMaritimeSingleWindow.Controllers
{
    //[Authorize]
    [Route("api/[controller]")]
    public class ShipController : Controller
    {
        readonly open_ssnContext _context;

        public ShipController(open_ssnContext context)
        {
            _context = context;
        }

        [HasClaim(Claims.Types.SHIP, Claims.Values.REGISTER)]
        [HttpPost("register")]
        public IActionResult RegisterShip([FromBody] Ship newShip)
        {
            try
            {
                _context.Ship.Add(newShip);
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message + ":\n" + e.InnerException.Message);
            }
            return Json(newShip);
        }

        private bool SearchContainsOnlyDigits(string str)
        {
            return str.All(c => c >= '0' && c <= '9');
        }

        public List<Ship> SearchShip(string searchTerm)
        {
            if (searchTerm.All(c => c >= '0' && c <= '9'))   // Checks if search only contains numbers
            {
                searchTerm += '%';
                return _context.Ship.Where(s =>
                            EF.Functions.ILike(s.Name, searchTerm)
                            || EF.Functions.Like(s.CallSign, searchTerm)
                            || EF.Functions.ILike(s.ImoNo.ToString(), searchTerm)
                            || EF.Functions.ILike(s.MmsiNo.ToString(), searchTerm))
                            .Select(s => s)
                            .Include(s => s.ShipStatus)
                            .Include(s => s.ShipContact)
                            .Take(10)
                            .ToList();
            }
            searchTerm += '%';
            return _context.Ship.Where(s =>
                        EF.Functions.ILike(s.Name, searchTerm)
                        || EF.Functions.ILike(s.CallSign, searchTerm))
                        .Select(s => s)
                        .Include(s => s.ShipStatus)
                        .Include(s => s.ShipContact)
                        .Take(10)
                        .ToList();
        }

        [HttpGet("search/{searchTerm}")]
        public JsonResult SearchShipWithFlag(string searchTerm)
        {

            List<Ship> results = SearchShip(searchTerm);
            List<ShipOverview> resultList = new List<ShipOverview>();

            foreach (Ship s in results)
            {

                ShipOverview searchItem = new ShipOverview();
                searchItem.Ship = s;

                // Find country id so we can get the country's 2CC which is used to add flags
                var cId = (from sfc in _context.ShipFlagCode
                           where sfc.ShipFlagCodeId == s.ShipFlagCodeId
                           select sfc.CountryId).FirstOrDefault();

                searchItem.Country = (from c in _context.Country
                                      where c.CountryId == cId
                                      select c).FirstOrDefault();

                searchItem.ShipType = (from st in _context.ShipType
                                       where st.ShipTypeId == s.ShipTypeId
                                       select st).FirstOrDefault();

                searchItem.ShipStatus = s.ShipStatus;
                searchItem.ContactList = s.ShipContact.ToList();
                resultList.Add(searchItem);

            }
            return Json(resultList);
        }

        [HttpGet("{id}")]
        public JsonResult GetShip(int id)
        {
            Ship ship = _context.Ship.First(t => t.ShipId == id);
            return Json(ship);
        }

    }
}
