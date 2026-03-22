using Microsoft.AspNetCore.Mvc;

namespace SampleApp.Web.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
