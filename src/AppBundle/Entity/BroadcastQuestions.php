<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * BroadcastQuestions
 *
 * @ORM\Table(name="Online_Comms.Broadcast_Questions", indexes={@ORM\Index(name="fk_Broadcast_Question_Global_Broadcast_Table1_idx", columns={"Broadcast_ID"}), @ORM\Index(name="fk_Broadcast_Question_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class BroadcastQuestions
{

    /**
     * @var \AppBundle\Entity\GlobalBroadcastTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\GlobalBroadcastTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Broadcast_ID", referencedColumnName="Broadcast_ID")
     * })
     */
    private $brodId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var string
     *
     * @ORM\Column(name="Question_Data", type="string", length=100)
    */
    private $data;

    /**
     * Set data
     *
     * @param string $data
     *
     * @return BroadcastQuestions
     */
    public function setData($data)
    {
        $this->data = $data;

        return $this;
    }

    /**
     * Get data
     *
     * @return string
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Set brodId
     *
     * @param \AppBundle\Entity\GlobalBroadcastTable $brodId
     *
     * @return BroadcastQuestions
     */
    public function setBrodId(\AppBundle\Entity\GlobalBroadcastTable $brodId = null)
    {
        $this->brodId = $brodId;

        return $this;
    }

    /**
     * Get brodId
     *
     * @return \AppBundle\Entity\GlobalBroadcastTable
     */
    public function getBrodId()
    {
        return $this->brodId;
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\UserTable $user
     *
     * @return BroadcastQuestions
     */
    public function setUser(\AppBundle\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}
