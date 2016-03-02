<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * QuestionsPrivilege
 *
 * @ORM\Table(name="Online_Comms.Question_Privilege",
 * indexes={@ORM\Index(name="fk_Question_Privilege_Global_Broadcast_Table1_idx", columns={"Broadcast_ID"}), @ORM\Index(name="fk_Question_Privilege_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class QuestionPrivilege
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
     * @var int
     *
     * @ORM\Column(name="Question_Count", type="integer")
    */
    private $qCount;

    /**
     * Set qCount
     *
     * @param integer $qCount
     *
     * @return QuestionPrivilege
     */
    public function setQCount($qCount)
    {
        $this->qCount = $qCount;

        return $this;
    }

    /**
     * Get qCount
     *
     * @return integer
     */
    public function getQCount()
    {
        return $this->qCount;
    }

    /**
     * Set brodId
     *
     * @param \AppBundle\Entity\GlobalBroadcastTable $brodId
     *
     * @return QuestionPrivilege
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
     * @return QuestionPrivilege
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
