using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using IMOMaritimeSingleWindow.Data;
using IMOMaritimeSingleWindow.Models;
using IMOMaritimeSingleWindow.Helpers;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;

namespace IMOMaritimeSingleWindow.Controllers
{
    [Route("api/[controller]")]
    public class CountryController : Controller
    {
        readonly open_ssnContext _context;

        public CountryController(open_ssnContext context)
        {
            _context = context;
        }

        [HttpGet("search/{searchTerm}")]
        public IActionResult Search(string searchTerm)
        {
            var countries = _context.Country.Where(c => EF.Functions.ILike(c.Name, searchTerm + '%'))
                                            .Select(c => c)
                                            .Include(c => c.ShipFlagCode)
                                            .Take(10)
                                            .ToList();

            List<CountrySearchResult> resultList = new List<CountrySearchResult>();

            foreach (Country c in countries)
            {
                CountrySearchResult searchItem = new CountrySearchResult();
                searchItem.Country = c;

                searchItem.ShipFlagCodes = c.ShipFlagCode.ToList();

                resultList.Add(searchItem);
            }
            return Json(resultList);
        }

        [HttpGet("getall")]
        public IActionResult GetAll()
        {
            var countries = _context.Country.ToList();
            return Json(countries);
        }




    }
}