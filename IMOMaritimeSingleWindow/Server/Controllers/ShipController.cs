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
        readonly IDbContext _context;

        public ShipController(IDbContext context)
        {
            _context = context;
        }

        [HasClaim(Claims.Types.SHIP, Claims.Values.REGISTER)]
        [HttpPost()]
        public IActionResult RegisterShip([FromBody] Ship newShip)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                _context.Ship.Add(newShip);
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }
            return Json(newShip);
        }

        [HasClaim(Claims.Types.SHIP, Claims.Values.REGISTER)]
        [HttpPut()]
        public IActionResult UpdateShip([FromBody] Ship ship)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                _context.Ship.Update(ship);
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }
            return Json(ship);
        }

        public List<Ship> SearchShip(string searchTerm)
        {
            if (searchTerm.All(c => c >= '0' && c <= '9'))   // Checks if search only contains numbers
            {
                searchTerm += '%';
                return _context.Ship.Where(s =>
                            EF.Functions.ILike(s.Name, searchTerm)
                            || EF.Functions.ILike(s.Name, "% " + searchTerm) //search for words in name
                            || EF.Functions.ILike(s.CallSign, searchTerm)
                            || EF.Functions.ILike(s.ImoNo.ToString(), searchTerm)
                            || EF.Functions.ILike(s.MmsiNo.ToString(), searchTerm))
                            .Select(s => s)
                            .Include(s => s.ShipStatus)
                            .Include(s => s.ShipContact)
                            .Include(s => s.ShipFlagCode.Country)
                            .Include(s => s.ShipType)
                            .Take(6)
                            .ToList();
            }
            searchTerm += '%';
            return _context.Ship.Where(s =>
                        EF.Functions.ILike(s.Name, searchTerm)
                        || EF.Functions.ILike(s.Name, "% " + searchTerm) //search for words in name
                        || EF.Functions.ILike(s.CallSign, searchTerm))
                        .Select(s => s)
                        .Include(s => s.ShipStatus)
                        .Include(s => s.ShipContact)
                        .Include(s => s.ShipFlagCode.Country)
                        .Include(s => s.ShipType)
                        .Take(6)
                        .ToList();
        }

        [HttpGet("search/{searchTerm}")]
        public JsonResult SearchShipWithFlag(string searchTerm)
        {

            List<Ship> results = SearchShip(searchTerm);
            return Json(results);
        }

        [HttpGet("{id}")]
        public JsonResult GetShip(int id)
        {
            Ship ship = _context.Ship.Where(t => t.ShipId == id)
                        .Include(s => s.ShipStatus)
                        .Include(s => s.ShipContact)
                            .ThenInclude(sc => sc.ContactMedium)
                        .Include(s => s.ShipFlagCode.Country)
                        .Include(s => s.ShipType)
                        .Include(s => s.ShipPowerType)
                        .Include(s => s.ShipLengthType)
                        .Include(s => s.ShipSource)
                        .Include(s => s.Organization)
                        .Include(s => s.ShipHullType)
                        .Include(s => s.ShipBreadthType)
                        .FirstOrDefault();
            return Json(ship);
        }

    }
}
