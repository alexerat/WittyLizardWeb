<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use App\Entity\UserTable;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class AccountController extends Controller
{
    /**
     * @Route("/myaccount", name="account_management")
     */
    public function manageAccountAction(Request $request)
    {

        $em = $this->getDoctrine()->getManager('user_conn');
        $room = $em->getRepository('App:TutorialRoomTable')->findOneBy(array('accessToken' => $roomToken));

        $user = $this->get('security.token_storage')->getToken()->getUser();

        return $this->render('account/account_management.html.twig', array());
    }
}
